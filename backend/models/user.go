package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID       primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Username string             `json:"username" bson:"username"`
	Password string             `json:"password" bson:"password"`
	Zones    []ZoneLite         `json:"zones" bson:"zones"`
	MyZones  []ZoneLite         `json:"myzones" bson:"myzones"`
	Likes    []string           `json:"likes,omitempty" bson:"likes,omitempty,default:[]"`
}
