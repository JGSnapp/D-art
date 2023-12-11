package models

import (
	"time"
)

type Message struct {
	ID       string    `json:"id" bson:"-"`
	Color    string    `json:"color" bson:"color"`
	Room     Coords    `json:"room" bson:"room"`
	FromRoom Coords    `json:"fromroom" bson:"fromroom"`
	Coords   Coords    `json:"coords" bson:"coords"`
	Width    float64   `json:"width" bson:"width"`
	Height   float64   `json:"height" bson:"height"`
	HTML     string    `json:"html" bson:"html"`
	CSS      string    `json:"css" bson:"css"`
	JS       string    `json:"js" bson:"js"`
	Content  string    `json:"content" bson:"content"`
	Time     time.Time `json:"time" bson:"time"`
	Type     string    `json:"type" bson:"type"`     // Add type field
	Author   string    `json:"author" bson:"author"` // New field: author's name
}
