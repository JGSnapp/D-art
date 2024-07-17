package models

import (
	"time"
)

type Message struct {
	ID        string    `json:"id" bson:"id"`
	Color     string    `json:"color" bson:"color"`
	Room      Coords    `json:"room" bson:"room"`
	FromRoom  Coords    `json:"fromroom" bson:"fromroom"`
	Coords    Coords    `json:"coords" bson:"coords"`
	Width     float64   `json:"width" bson:"width"`
	Height    float64   `json:"height" bson:"height"`
	HTML      string    `json:"html" bson:"html"`
	Content   string    `json:"content" bson:"content"`
	Time      time.Time `json:"time" bson:"time"`
	Type      string    `json:"type" bson:"type"`
	TypeBlock string    `json:"typeblock" bson:"typeblock"`
	Author    string    `json:"author" bson:"author"`
	Color1    string    `json:"color1" bson:"color1"`
	Color2    string    `json:"color2" bson:"color2"`
	Tags      []string  `json:"tags" bson:"tags"`
}
