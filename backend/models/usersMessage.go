package models

type UsersMessage struct {
	Type  string  `json:"type" bson:"type"` // Add type field
	Users []*User `json:"users" bson:"users"`
}
