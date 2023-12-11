package models

type ZoneLite struct {
	ID      string `json:"id" bson:"id"`
	Coords  Coords `json:"coords" bson:"coords"`
	Content string `json:"content" bson:"content"`
}
