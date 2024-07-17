package models

type UsernameMessage struct {
	Type     string `json:"type" bson:"type"` // Add type field
	Username string `json:"username" bson:"username"`
}
