package main

import (
	"context"
	"log"
	"time"

	"backend/controllers"
	"backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Initialize MongoDB client
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := client.Connect(ctx); err != nil {
		log.Fatal(err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("MongoDB not connected:", err)
	} else {
		log.Println("✅ MongoDB connected successfully")
	}

	db := client.Database("image_db")
	imageCollection := db.Collection("images")
	projectCollection := db.Collection("projects")

	// Initialize Gin
	router := gin.Default()
	router.Static("/uploads", "./uploads")

	// ----- Add CORS middleware -----
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://127.0.0.1:3002"}, // frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ----- Setup Routes -----
	// Image routes
	imageGroup := router.Group("/images")
	{
		imageGroup.POST("/upload", controllers.UploadImages(imageCollection))
		imageGroup.POST("/save-groundtruth", controllers.SaveGroundTruth(imageCollection))
	}

	// Project routes
	routes.ProjectRoutes(router, projectCollection)

	// Start server
	router.Run(":5000")
}
