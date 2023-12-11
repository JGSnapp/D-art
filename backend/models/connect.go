package models

import (
	"github.com/gorilla/websocket"
)

type Connect struct {
	Connection *websocket.Conn
	Rooms      map[Coords]*Room // Map of subscribed rooms
	Username   string           // Store the username
}
