package models

type LikeMessage struct {
	Type  string   `json:"type" bson:"type"` // Add type field
	Likes []string `json:"likes" bson:"likes"`
}
