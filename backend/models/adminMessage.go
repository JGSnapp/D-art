package models

import (
	"time"
)

type AdminMessage struct {
	Skip     int64     `json:"skip" bson:"skip"`
	Limit    int64     `json:"limit" bson:"limit"`
	Type     string    `json:"type" bson:"type"`
	ID       string    `json:"id" bson:"id"`
	RoomXMax string    `json:"roomxmax" bson:"roomxmax"`
	RoomXMin string    `json:"roomxmin" bson:"roomxmin"`
	RoomYMax string    `json:"roomymax" bson:"roomymax"`
	RoomYMin string    `json:"roomymin" bson:"roomymin"`
	Width    *float64  `json:"width" bson:"width"`
	Height   *float64  `json:"height" bson:"height"`
	Content  string    `json:"content" bson:"content"`
	Time     time.Time `json:"time" bson:"time"`
	Author   string    `json:"author" bson:"author"`
	Zone     string    `json:"zone" bson:"zone"`
}
