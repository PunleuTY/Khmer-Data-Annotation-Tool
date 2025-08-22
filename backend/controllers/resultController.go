package controllers

import (
	"context"
	"net/http"

	"backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// GetResult fetches image result by filename (query parameter)
func GetResult(imageCollection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		filename := c.Query("filename") // <-- use query
		if filename == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "filename query parameter required"})
			return
		}

		var image models.Image
		err := imageCollection.FindOne(context.Background(), bson.M{"name": filename}).Decode(&image)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"filename":    image.Name,
			"path":        image.Path,
			"status":      image.Status,
			"annotations": image.Annotations,
			"meta":        image.Meta,
		})
	}
}
