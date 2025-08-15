package main

import (
	// "backend/database"
	// "backend/models"
	// "backend/routes"
	// "log"
	// "net/http"
	// "github.com/gorilla/mux"

	// controller
	apiPython "backend/api"
	annotationController "backend/controller"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to DB
	// config.ConnectDB()

	// // Auto migrate User model
	// config.DB.AutoMigrate(&models.User{})
	// println("Database connected and User table migrated successfully.")

	// Set up routes
	// r := mux.NewRouter()
	// routes.UserRoutes(r)

	// Start server
	// log.Println("Server running on port 8080")
	// log.Fatal(http.ListenAndServe(":8080", r))
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.POST("/annotations", annotationController.PostAnnotation)
	r.GET("/login", apiPython.Login)
	r.Run(":8080") // run on port 8080
}
