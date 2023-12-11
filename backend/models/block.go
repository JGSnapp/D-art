package models

import (
	"time"
)

type Block struct {
	ID     string    `json:"id" bson:"id"`
	Room   Coords    `json:"room" bson:"room"`
	Coords Coords    `json:"coords" bson:"coords"`
	Width  float64   `json:"width" bson:"width"`
	Height float64   `json:"height" bson:"height"`
	HTML   string    `json:"html" bson:"html"`
	CSS    string    `json:"css" bson:"css"`
	JS     string    `json:"js" bson:"js"`
	Time   time.Time `json:"time" bson:"time"`
	Author string    `json:"author" bson:"author"` // New field: author's name
	Zone   string    `json:"zone" bson:"zone"`
	Image  bool      `json:"image" bson:"image"`
}
