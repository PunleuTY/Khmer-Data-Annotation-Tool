package config

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := "host=localhost user=postgres password=170905 dbname=Khmer_Validate_Tool port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	// debug
	if err != nil {
		panic("Failed to connect to database!")
	}
	fmt.Println("Database connected successfully!")
	fmt.Println("Database connected successfully!")

	DB = db
}
