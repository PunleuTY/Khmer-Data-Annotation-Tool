package main

// import (
// 	"context"
// 	"log"
// 	"time"

// 	"backend/routes"

// 	"github.com/gin-gonic/gin"
// 	"go.mongodb.org/mongo-driver/mongo"
// 	"go.mongodb.org/mongo-driver/mongo/options"
// )

// func main() {
// 	// Initialize MongoDB client
// 	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://localhost:27017"))
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()

// 	if err := client.Connect(ctx); err != nil {
// 		log.Fatal(err)
// 	}

// 	// Ping to check connection
// 	if err := client.Ping(ctx, nil); err != nil {
// 		log.Fatal("MongoDB not connected:", err)
// 	} else {
// 		log.Println("✅ MongoDB connected successfully")
// 	}

// 	db := client.Database("image_db")
// 	imageCollection := db.Collection("images")

// 	router := gin.Default()
// 	router.Static("/uploads", "./uploads")

// 	routes.SetupRoutes(router, imageCollection)
// 	routes.SetupResultRoutes(router, imageCollection)

// 	router.Run(":5000")
// }
import (
	"context"
	"log"
	"time"

	"backend/routes"

	"github.com/gin-contrib/cors" // <-- add this
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

	router := gin.Default()
	router.Static("/uploads", "./uploads")

	// ----- Add CORS middleware -----
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://127.0.0.1:5500"}, // frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	routes.SetupRoutes(router, imageCollection)
	routes.SetupResultRoutes(router, imageCollection)

	router.Run(":5000")
}
