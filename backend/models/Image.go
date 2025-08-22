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
