package annotationController

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

type Annotation struct {
	ID    string `json:"id" binding:"required"`
	Label string `json:"label" binding:"required"`
	Image string `json:"image,omitempty"` // Optional in JSON mode
	Rect  struct {
		X int `json:"x" binding:"required"`
		Y int `json:"y" binding:"required"`
		W int `json:"w" binding:"required"`
		H int `json:"h" binding:"required"`
	} `json:"rect" binding:"required"`
	Text string `json:"text" binding:"required"` // Stringified JSON
}

func PostAnnotation(c *gin.Context) {
	var (
		id       string
		label    string
		imageURL string
		data Annotation
	)

	// Detect multipart/form-data upload
	if c.ContentType() == "multipart/form-data" {
		file, err := c.FormFile("image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Image file required in multipart/form-data"})
			return
		}

		id = c.PostForm("id")
		label = c.PostForm("label")

		if id == "" || label == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID and label are required"})
			return
		}

		// Ensure uploads directory exists
		if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create uploads directory"})
			return
		}

		// Create unique filename to avoid overwriting
		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("%s_%d%s", id, time.Now().UnixNano(), ext)
		savePath := filepath.Join("uploads", filename)

		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		imageURL = savePath
		fmt.Println("Image saved at:", savePath)

	} else {
		// Handle JSON body
		var annotation Annotation
		if err := c.ShouldBindJSON(&annotation); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		id = annotation.ID
		label = annotation.Label
		imageURL = annotation.Image
		data.Text = annotation.Text
		data.Rect = annotation.Rect
	}

	// Simulate DB save here
	fmt.Printf("Annotation saved: ID=%s, Label=%s, Image=%s\n", id, label, imageURL)

	// Response
	c.JSON(http.StatusOK, gin.H{
		"message":  "Annotation posted successfully",
		"id":       id,
		"label":    label,
		"image":    imageURL,
		"uploaded": imageURL != "",
		"rect": gin.H{
			"x": data.Rect.X,
			"y": data.Rect.Y,
			"w": data.Rect.W,
			"h": data.Rect.H,
		},
		"text": data.Text,
	})
}

