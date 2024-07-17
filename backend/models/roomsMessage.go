package models

type RoomsMessage struct {
	Type  string  `json:"type" bson:"type"` // Add type field
	Rooms []*Room `json:"room" bson:"room"`
}
