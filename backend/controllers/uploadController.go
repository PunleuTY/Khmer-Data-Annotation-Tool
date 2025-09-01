package controllers

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"backend/models"

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
				data, err := os.ReadFile(tempPath)
				if err != nil {
					doneChan <- Result{FileName: file.Filename, Annotations: json.RawMessage("[]")}
					return
				}
				base64Str := "data:image/jpeg;base64," + base64.StdEncoding.EncodeToString(data)

				// Save image metadata with ProjectID + annotations
				imageDoc := models.Image{
					ProjectID: projectID,
					Name:      filepath.Base(tempPath),
					Path:      tempPath,
					Base64:    base64Str,
					Status:    "pending",
					// Annotations: []models.Annotation{},
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
