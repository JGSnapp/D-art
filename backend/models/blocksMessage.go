package models

type BlocksMessage struct {
	Type   string   `json:"type" bson:"type"` // Add type field
	Blocks []*Block `json:"blocks" bson:"blocks"`
}
