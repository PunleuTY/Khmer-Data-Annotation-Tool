package controllers

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"backend/models"

	_ "image/jpeg"
	_ "image/png"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// UploadImages handles multiple image uploads and sends them asynchronously to YOLO FastAPI
func UploadImages(imageCollection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.PostForm("project_id")
		if projectIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing project_id"})
			return
		}
		projectID, err := primitive.ObjectIDFromHex(projectIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project_id"})
			return
		}

		form, err := c.MultipartForm()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form"})
			return
		}
		files := form.File["images"]
		if len(files) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
			return
		}

		// Coordinate annotations from user added new
		annotationsStr := c.PostForm("annotations")
		var annotations []models.Annotation
		if annotationsStr != "" {
			if err := json.Unmarshal([]byte(annotationsStr), &annotations); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid annotations JSON"})
				return
			}
		}

		tempDir := "uploads/temp/"
		os.MkdirAll(tempDir, os.ModePerm)

		type Result struct {
			ImageID     primitive.ObjectID
			FileName    string
			Annotations json.RawMessage
			Base64      string
		}
		doneChan := make(chan Result, len(files))

		for _, file := range files {
			go func(file *multipart.FileHeader) {
				timestamp := time.Now().UnixNano()
				tempPath := filepath.Join(tempDir, fmt.Sprintf("%d_%s", timestamp, file.Filename))
				if err := c.SaveUploadedFile(file, tempPath); err != nil {
					doneChan <- Result{FileName: file.Filename, Annotations: json.RawMessage("[]")}
					return
				}
				// Convert to Base64
				// Read file
				data, err := os.ReadFile(tempPath)
				if err != nil {
					doneChan <- Result{FileName: file.Filename, Annotations: json.RawMessage("[]")}
					return
				}

				// Decode image to get dimensions
				imgConfig, _, err := image.DecodeConfig(bytes.NewReader(data))
				if err != nil {
					fmt.Println("Failed to decode image:", err)
					imgConfig.Width = 0
					imgConfig.Height = 0
				}

				// Convert to Base64
				base64Str := "data:image/jpeg;base64," + base64.StdEncoding.EncodeToString(data)

				// Save image metadata with ProjectID + annotations
				imageDoc := models.Image{
					ProjectID:   projectID,
					Name:        filepath.Base(tempPath),
					Path:        tempPath,
					Base64:      base64Str,
					Status:      "pending",
					Width:       imgConfig.Width,
					Height:      imgConfig.Height,
					Annotations: annotations,
				}

				res, err := imageCollection.InsertOne(context.Background(), imageDoc)
				if err != nil {
					doneChan <- Result{FileName: file.Filename, Annotations: json.RawMessage("[]")}
					return
				}
				imageDoc.ID = res.InsertedID.(primitive.ObjectID)

				// Send to YOLO FastAPI
				body := &bytes.Buffer{}
				writer := multipart.NewWriter(body)
				f, err := os.Open(tempPath)
				if err != nil {
					doneChan <- Result{FileName: imageDoc.Name, Annotations: json.RawMessage("[]")}
					return
				}
				defer f.Close()
				fileWriter, _ := writer.CreateFormFile("image", filepath.Base(tempPath))
				io.Copy(fileWriter, f)
				// writer.WriteField("annotations", "[]")
				annotationsJSON, _ := json.Marshal(annotations)
				writer.WriteField("annotations", string(annotationsJSON))
				writer.Close()

				client := &http.Client{Timeout: 60 * time.Second}

				//FAST API HERE
				req, _ := http.NewRequest("POST", "http://127.0.0.1:8000/images/", body)
				req.Header.Set("Content-Type", writer.FormDataContentType())

				resp, err := client.Do(req)
				if err != nil {
					doneChan <- Result{ImageID: imageDoc.ID, FileName: imageDoc.Name, Annotations: json.RawMessage("[]")}
					return
				}
				defer resp.Body.Close()

				var result map[string]interface{}
				if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
					doneChan <- Result{ImageID: imageDoc.ID, FileName: imageDoc.Name, Annotations: json.RawMessage("[]")}
					return
				}

				boxes, _ := json.Marshal(result["processing_result"])
				doneChan <- Result{ImageID: imageDoc.ID, FileName: imageDoc.Name, Annotations: boxes}
			}(file)
		}

		// Collect all results

		results := []Result{}
		for i := 0; i < len(files); i++ {
			res := <-doneChan
			results = append(results, res)
		}

		imagesList := []map[string]interface{}{}
		annotationsMap := map[string]json.RawMessage{}
		for _, r := range results {
			imageIDStr := r.ImageID.Hex()
			if r.ImageID.IsZero() {
				imageIDStr = r.FileName // fallback
			}
			imagesList = append(imagesList, map[string]interface{}{
				"id":        imageIDStr,
				"file_name": r.FileName,
				"base64":    r.Base64,
			})
			annotationsMap[imageIDStr] = r.Annotations
		}

		c.JSON(http.StatusOK, gin.H{
			"meta": models.Meta{
				Tool:      "Khmer Data Annotation Tool",
				Lang:      "khm",
				Timestamp: time.Now().Format(time.RFC3339),
			},
			"images":      imagesList,
			"annotations": annotationsMap,
		})

	}
}

// SaveGroundTruth moves image to final folder and updates annotations
func SaveGroundTruth(imageCollection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Filename    string              `json:"filename"`
			ProjectID   string              `json:"project_id"`
			Annotations []models.Annotation `json:"annotations"`
			Meta        models.Meta         `json:"meta"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
			return
		}

		projectID, err := primitive.ObjectIDFromHex(req.ProjectID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project_id"})
			return
		}

		var image models.Image
		err = imageCollection.FindOne(context.Background(), bson.M{"name": req.Filename, "project_id": projectID}).Decode(&image)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found", "details": err.Error()})
			return
		}

		finalDir := "uploads/final/"
		os.MkdirAll(finalDir, os.ModePerm)
		finalPath := filepath.Join(finalDir, req.Filename)
		if err := os.Rename(image.Path, finalPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to move file", "details": err.Error()})
			return
		}
		// Regenerate Base64
		data, _ := os.ReadFile(finalPath)
		base64Str := "data:image/jpeg;base64," + base64.StdEncoding.EncodeToString(data)

		update := bson.M{
			"$set": bson.M{
				"annotations": req.Annotations,
				"status":      "final",
				"path":        finalPath,
				"base64":      base64Str,
				"meta":        req.Meta, // make sure Image struct has Meta if needed
			},
		}
		_, err = imageCollection.UpdateByID(context.Background(), image.ID, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update image in DB", "details": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":  "Ground truth saved successfully",
			"filename": req.Filename,
		})
	}
}

// package controllers

// import (
// 	"context"
// 	"encoding/base64"
// 	"log"
// 	"net/http"
// 	"os"
// 	"path/filepath"

// 	"backend/models"

// 	"github.com/gin-gonic/gin"
// 	"go.mongodb.org/mongo-driver/bson"
// 	"go.mongodb.org/mongo-driver/bson/primitive"
// 	"go.mongodb.org/mongo-driver/mongo"
// )

// // SaveGroundTruth handles saving image + annotations + base64 to MongoDB
// func SaveGroundTruth(imageCollection *mongo.Collection) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		var req struct {
// 			Filename    string              `json:"filename"`
// 			ProjectID   string              `json:"project_id"`
// 			Annotations []models.Annotation `json:"annotations"`
// 			Meta        models.Meta         `json:"meta"`
// 			Base64Image string              `json:"base64_image"`
// 		}

// 		if err := c.ShouldBindJSON(&req); err != nil {
// 			log.Println("BindJSON error:", err)
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
// 			return
// 		}

// 		// Validate project ID
// 		projectID, err := primitive.ObjectIDFromHex(req.ProjectID)
// 		if err != nil {
// 			log.Println("Invalid project_id:", req.ProjectID)
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project_id"})
// 			return
// 		}

// 		// Check if image exists
// 		var imageDoc models.Image
// 		err = imageCollection.FindOne(context.Background(), bson.M{"name": req.Filename, "project_id": projectID}).Decode(&imageDoc)
// 		if err != nil {
// 			// Image not found → create new
// 			imageDoc = models.Image{
// 				ProjectID:   projectID,
// 				Name:        req.Filename,
// 				Status:      "final",
// 				Annotations: req.Annotations,
// 				Meta:        req.Meta,
// 			}
// 		}

// 		// Ensure uploads folder exists
// 		finalDir := "uploads/final/"
// 		os.MkdirAll(finalDir, os.ModePerm)
// 		finalPath := filepath.Join(finalDir, req.Filename)

// 		// Save base64 image
// 		if req.Base64Image != "" {
// 			data, err := base64.StdEncoding.DecodeString(req.Base64Image)
// 			if err != nil {
// 				log.Println("Base64 decode error:", err)
// 				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid base64 image"})
// 				return
// 			}
// 			if err := os.WriteFile(finalPath, data, 0644); err != nil {
// 				log.Println("Failed to write image file:", err)
// 				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
// 				return
// 			}
// 			imageDoc.Path = finalPath
// 			imageDoc.Base64 = "data:image/jpeg;base64," + req.Base64Image
// 		} else if imageDoc.Path != "" {
// 			// Move existing image to final path if needed
// 			os.Rename(imageDoc.Path, finalPath)
// 			data, _ := os.ReadFile(finalPath)
// 			imageDoc.Base64 = "data:image/jpeg;base64," + base64.StdEncoding.EncodeToString(data)
// 			imageDoc.Path = finalPath
// 		} else {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "No image data provided"})
// 			return
// 		}

// 		// Update annotations, meta, and status
// 		imageDoc.Annotations = req.Annotations
// 		imageDoc.Meta = req.Meta
// 		imageDoc.Status = "final"
// 		imageDoc.ProjectID = projectID

// 		if imageDoc.ID.IsZero() {
// 			// Insert new image
// 			res, err := imageCollection.InsertOne(context.Background(), imageDoc)
// 			if err != nil {
// 				log.Println("Insert failed:", err)
// 				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert image", "details": err.Error()})
// 				return
// 			}
// 			imageDoc.ID = res.InsertedID.(primitive.ObjectID)
// 			log.Println("Inserted new image with ID:", imageDoc.ID.Hex())
// 		} else {
// 			// Update existing image
// 			_, err := imageCollection.UpdateByID(context.Background(), imageDoc.ID, bson.M{
// 				"$set": bson.M{
// 					"annotations": imageDoc.Annotations,
// 					"status":      imageDoc.Status,
// 					"path":        imageDoc.Path,
// 					"base64":      imageDoc.Base64,
// 					"meta":        imageDoc.Meta,
// 				},
// 			})
// 			if err != nil {
// 				log.Println("Update failed:", err)
// 				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update image", "details": err.Error()})
// 				return
// 			}
// 			log.Println("Updated image ID:", imageDoc.ID.Hex())
// 		}

// 		c.JSON(http.StatusOK, gin.H{
// 			"message":  "Ground truth saved successfully",
// 			"filename": req.Filename,
// 			"id":       imageDoc.ID.Hex(),
// 		})
// 	}
// }
