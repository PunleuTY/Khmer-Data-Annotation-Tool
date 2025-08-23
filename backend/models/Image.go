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

// package models

// import (
// 	"time"

// 	"go.mongodb.org/mongo-driver/bson/primitive"
// )

// type Point struct {
// 	X int `bson:"x" json:"x"`
// 	Y int `bson:"y" json:"y"`
// }

// type Rect struct {
// 	X int `bson:"x" json:"x"`
// 	Y int `bson:"y" json:"y"`
// 	W int `bson:"w" json:"w"`
// 	H int `bson:"h" json:"h"`
// }

// type Annotation struct {
// 	ID     string  `bson:"id" json:"id"`
// 	Type   string  `bson:"type" json:"type"` // box, polygon, etc.
// 	Rect   *Rect   `bson:"rect,omitempty" json:"rect,omitempty"`
// 	Points []Point `bson:"points,omitempty" json:"points,omitempty"`
// 	Text   string  `bson:"text,omitempty" json:"text,omitempty"`
// 	GT     string  `bson:"gt,omitempty" json:"gt,omitempty"`
// }

// type Meta struct {
// 	Tool      string `bson:"tool,omitempty" json:"tool"`
// 	Lang      string `bson:"lang,omitempty" json:"lang"`
// 	Timestamp string `bson:"timestamp,omitempty" json:"timestamp"`
// }

// type Image struct {
// 	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
// 	ProjectID   primitive.ObjectID `bson:"project_id" json:"project_id"`
// 	Name        string             `bson:"name" json:"name"`
// 	Path        string             `bson:"path" json:"path"`
// 	URL         string             `bson:"url,omitempty" json:"url,omitempty"`
// 	Width       int                `bson:"width" json:"width"`
// 	Height      int                `bson:"height" json:"height"`
// 	Status      string             `bson:"status" json:"status"` // pending/final
// 	Annotations []Annotation       `bson:"annotations" json:"annotations"`
// }

// type Project struct {
// 	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
// 	Name        string             `bson:"name" json:"name"`
// 	Description string             `bson:"description,omitempty" json:"description,omitempty"`
// 	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
// 	UpdatedAt   time.Time          `bson:"updated_at,omitempty" json:"updated_at,omitempty"`
// 	Status      string             `bson:"status,omitempty" json:"status"` // active/archived/deleted
// 	Lang        string             `bson:"lang,omitempty" json:"lang"`
// 	TS          int64              `bson:"ts" json:"ts"`
// 	CurrentID   primitive.ObjectID `bson:"current_id,omitempty" json:"current_id"`
// }

// type ExportResponse struct {
// 	Meta        Meta                     `json:"meta"`
// 	Images      []map[string]interface{} `json:"images"`
// 	Annotations map[string][]Annotation  `json:"annotations"`
// }
