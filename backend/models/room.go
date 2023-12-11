package models

import "github.com/gorilla/websocket"

type Room struct {
	Coords  Coords
	Clients []*websocket.Conn
	Blocks  []Block
	Zones   []Zone
}
