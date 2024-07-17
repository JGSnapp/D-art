package models

import (
	"time"
)

type Zone struct {
	ID      string    `json:"id" bson:"id"`
	Color   string    `json:"color" bson:"color"`
	Room    Coords    `json:"room" bson:"room"`
	Coords  Coords    `json:"coords" bson:"coords"`
	Width   float64   `json:"width" bson:"width"`
	Height  float64   `json:"height" bson:"height"`
	Content string    `json:"content" bson:"content"`
	Tags 	[]string  `json:"tags" bson:"tags"`
	Time    time.Time `json:"time" bson:"time"`
	Author  string    `json:"author" bson:"author"` // New field: author's name
}
