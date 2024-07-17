package models

type ConnectionsMessage struct {
	Type        string `json:"type" bson:"type"` // Add type field
	Connections int    `json:"connections" bson:"connections"`
}
