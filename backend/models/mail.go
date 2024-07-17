package models

type Mail struct {
	Email string `json:"email" bson:"email"`
	Code  string `json:"code" bson:"code"`
}
