package models

type ZoneLiteMessage struct {
	Type  string     `json:"type" bson:"type"` // Add type field
	Zones []ZoneLite `json:"zones" bson:"zones"`
}
