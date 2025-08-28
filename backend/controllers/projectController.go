package controllers

import (
	"context"
	"net/http"
	"time"

	"backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// CreateProject creates a new project
func CreateProject(projectCollection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Name        string `json:"name" binding:"required"`
			Description string `json:"description"`
			Lang        string `json:"lang"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		project := models.Project{
			Name:        req.Name,
			Description: req.Description,
			Status:      "active",
			Lang:        req.Lang,
			TS:          time.Now().Unix(),
			CreatedAt:   time.Now(),
		}

		res, err := projectCollection.InsertOne(context.Background(), project)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
			return
		}
		project.ID = res.InsertedID.(primitive.ObjectID)

		c.JSON(http.StatusOK, gin.H{"project": project})
	}
}

// GetProjects returns all projects
func GetProjects(projectCollection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		cursor, err := projectCollection.Find(context.Background(), bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
			return
		}
		defer cursor.Close(context.Background())

		projects := []models.Project{}
		for cursor.Next(context.Background()) {
			var p models.Project
			cursor.Decode(&p)
			projects = append(projects, p)
		}

		c.JSON(http.StatusOK, gin.H{"projects": projects})
	}
}

// GetProjectByID returns a single project by ID
func GetProjectByID(projectCollection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		projectID, err := primitive.ObjectIDFromHex(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}

		var project models.Project
		err = projectCollection.FindOne(context.Background(), bson.M{"_id": projectID}).Decode(&project)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"project": project})
	}
}

// UpdateProject updates project info
func UpdateProject(projectCollection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		projectID, err := primitive.ObjectIDFromHex(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}

		var req struct {
			Name        string `json:"name"`
			Description string `json:"description"`
			Status      string `json:"status"` // active/archived/deleted
			Lang        string `json:"lang"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		update := bson.M{
			"$set": bson.M{
				"name":        req.Name,
				"description": req.Description,
				"status":      req.Status,
				"lang":        req.Lang,
				"updated_at":  time.Now(),
			},
		}

		_, err = projectCollection.UpdateByID(context.Background(), projectID, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Project updated successfully"})
	}
}

// DeleteProject deletes a project
func DeleteProject(projectCollection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		projectID, err := primitive.ObjectIDFromHex(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}

		_, err = projectCollection.DeleteOne(context.Background(), bson.M{"_id": projectID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
	}
}

// added new get images by project
func GetImagesByProject(imageCollection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectID := c.Param("id")

		objID, err := primitive.ObjectIDFromHex(projectID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}

		// use project_id (snake_case) because that’s what your docs have
		filter := bson.M{"project_id": objID}

		cursor, err := imageCollection.Find(context.Background(), filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch images"})
			return
		}
		defer cursor.Close(context.Background())

		var images []models.Image
		if err := cursor.All(context.Background(), &images); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode images"})
			return
		}

		c.JSON(http.StatusOK, images)
	}
}
