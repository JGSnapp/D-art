package models

type PatternMessage struct {
	Type     string    `json:"type" bson:"type"` // Add type field
	Patterns []Pattern `json:"patterns" bson:"patterns"`
}
