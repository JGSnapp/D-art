package models

import "github.com/gorilla/websocket"

type Room struct {
	Coords  Coords            `json:"coords" bson:"coords"`
	Clients []*websocket.Conn `json:"clients" bson:"clients"`
	Blocks  []Block           `json:"blocks" bson:"blocks"`
	Zones   []Zone            `json:"zones" bson:"zones"`
}
