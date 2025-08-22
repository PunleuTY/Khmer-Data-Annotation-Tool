package routes

import (
	"backend/controllers"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupResultRoutes(router *gin.Engine, imageCollection *mongo.Collection) {
	resultGroup := router.Group("/results")
	{
		resultGroup.GET("", controllers.GetResult(imageCollection)) // use query 
	}
}
