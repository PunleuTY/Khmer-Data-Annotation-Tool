package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Meta struct {
	Tool      string `bson:"tool,omitempty" json:"tool"`
	Lang      string `bson:"lang,omitempty" json:"lang"`
	Timestamp string `bson:"timestamp,omitempty" json:"timestamp"`
}
type Image struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Name        string             `bson:"name"`
	Path        string             `bson:"path"`
	Width       int                `bson:"width,omitempty"`
	Height      int                `bson:"height,omitempty"`
	Status      string             `bson:"status"`
	Annotations []interface{}      `bson:"annotations"` // finall box when user verify it is correct
	Meta        Meta               `bson:"meta,omitempty" json:"meta"`
}

// // Project structure
// type Project struct {
// 	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
// 	Name        string               `bson:"name" json:"name"`
// 	Description string               `bson:"description,omitempty" json:"description"`
// 	CreatedAt   primitive.DateTime   `bson:"created_at" json:"created_at"`
// 	Images      []primitive.ObjectID `bson:"images,omitempty" json:"images"` // references to Image IDs
// }
