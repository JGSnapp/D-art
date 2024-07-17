package models

type Pattern struct {
	ID      string `json:"id" bson:"id"`
	HTML    string `json:"html" bson:"html"`
	Content string `json:"content" bson:"content"`
	Author  string `json:"author" bson:"author"` // New field: author's name
	Likes   int32  `json:"likes" bson:"likes"`
	Type    string `json:"type" bson:"type"`
}
