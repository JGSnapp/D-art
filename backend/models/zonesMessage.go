package models

type ZonesMessage struct {
	Type  string  `json:"type" bson:"type"` // Add type field
	Zones []*Zone `json:"zones" bson:"zones"`
}
