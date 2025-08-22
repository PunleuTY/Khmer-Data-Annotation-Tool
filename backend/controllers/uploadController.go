package controllers

import (
	"bytes"
	"context"
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

// Upload and send to FastAPI (YOLO) for preview
func UploadImage(imageCollection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		file, err := c.FormFile("image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
			return
		}

		timestamp := time.Now().Unix()
		tempDir := "uploads/temp/"
		os.MkdirAll(tempDir, os.ModePerm)
		tempPath := filepath.Join(tempDir, fmt.Sprintf("%d_%s", timestamp, file.Filename))
		if err := c.SaveUploadedFile(file, tempPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}

		// Save initial metadata in MongoDB
		image := models.Image{
			Name:        filepath.Base(tempPath),
			Path:        tempPath,
			Status:      "pending",
			Annotations: []interface{}{},
		}
		res, _ := imageCollection.InsertOne(context.Background(), image)
		image.ID = res.InsertedID.(primitive.ObjectID)

		// Send image to FastAPI YOLO  URL can change according to your setup
		fastapiURL := "http://127.0.0.1:8000/images/"
		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)
		fileWriter, _ := writer.CreateFormFile("image", filepath.Base(tempPath))
		f, _ := os.Open(tempPath)
		defer f.Close()
		io.Copy(fileWriter, f)
		writer.WriteField("annotations", "[]")
		writer.Close()

		client := &http.Client{Timeout: 30 * time.Second}
		req, _ := http.NewRequest("POST", fastapiURL, body)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send to FastAPI"})
			return
		}
		defer resp.Body.Close()

		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)
		boxes, _ := json.Marshal(result["processing_result"])

		c.JSON(http.StatusOK, gin.H{
			"message":     "Preview ready",
			"filename":    image.Name,
			"annotations": json.RawMessage(boxes),
		})
	}
}

//Save ground truth annotations and move image to final folder
// when user confirms the result
// This function is called by the frontend after user confirms the result

func SaveGroundTruth(imageCollection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Filename    string        `json:"filename"`
			Annotations []interface{} `json:"annotations"`
			Meta        models.Meta   `json:"meta"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
			return
		}

		// Find image in DB using the exact filename returned by /upload
		var image models.Image
		err := imageCollection.FindOne(context.Background(), bson.M{"name": req.Filename}).Decode(&image)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found", "details": err.Error()})
			return
		}

		// Move file to final folder
		finalDir := "uploads/final/"
		os.MkdirAll(finalDir, os.ModePerm)
		finalPath := filepath.Join(finalDir, req.Filename)
		if err := os.Rename(image.Path, finalPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to move file", "details": err.Error()})
			return
		}

		// Update MongoDB document with annotations, meta, and new path
		update := bson.M{
			"$set": bson.M{
				"annotations": req.Annotations,
				"status":      "final",
				"path":        finalPath,
				"meta":        req.Meta,
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
