package main

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"backend/models"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

const (
	smtpHost    = "smtp.example.com"
	smtpPort    = "587"
	senderEmail = "auth@d-art.space"
	password    = "oDem7p+OZy-xSG"
)

var connections = make(map[*websocket.Conn]*models.Connect)
var rooms = make(map[models.Coords]*models.Room)
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var client *mongo.Client

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	clientOptions := options.Client().ApplyURI("mongodb://root:example@mongo:27017")
	client, _ = mongo.Connect(ctx, clientOptions)
	defer func() {
		if err := client.Disconnect(ctx); err != nil {
			panic(err)
		}
	}()
	// ??? ?????? ???????????????
	//idArray := []string{}
	idArray := []string{"__count", "__text", "__image"}
	log.Println("ggggggggggggge")

	// ?????? ?? ??????? ???????????????
	for _, id := range idArray {
		// ???????? ??????? ???????? ? ?????? id
		collection := client.Database("chat").Collection("patterns")
		filter := bson.M{"id": id}
		var result *models.Pattern
		err := collection.FindOne(context.Background(), filter).Decode(&result)
		if err == mongo.ErrNoDocuments {
			log.Println("sss")
			// ??????? ???????????, ?????????

			// ????? ???????? ?????
			subFolderPath := filepath.Join("./blocks", id)
			if _, err := os.Stat(subFolderPath); err == nil {
				// ?????? ??????
				fileExtensions := []string{"name.txt"}
				var fileContents []string

				for _, file := range fileExtensions {
					filePath := filepath.Join(subFolderPath, file)
					content, err := ioutil.ReadFile(filePath)
					if err != nil {
						log.Println("Error reading file:", err)
						continue
					}
					fileContents = append(fileContents, string(content))
				}

				// ?????? ??????????? ? ???? ??????
				document := models.Pattern{
					ID:      id,
					Author:  "D`art",
					Content: fileContents[0],
					Likes:   100,
					Type:    fileContents[0],
					HTML:    `__id__;__author__;__name__`,
				}
				_, err := collection.InsertOne(context.Background(), document)
				if err != nil {
					log.Println("Error inserting document:", err)
				} else {
					fmt.Println("Document inserted:", id)
				}
			}
		} else if err != nil {
			log.Println("Error finding document:", err)
		}
	}

	collection := client.Database("chat").Collection("zones")
	filter := bson.M{"id": ".settings"}
	var result *models.Zone
	err := collection.FindOne(context.Background(), filter).Decode(&result)
	if err == mongo.ErrNoDocuments {
		log.Println("ddddddddddddd")
		// ?????? ??????????? ? ???? ??????
		document := models.Zone{
			ID: ".settings",
			Coords: models.Coords{
				X: 805,
				Y: 0,
			},
			Room: models.Coords{
				X: 0,
				Y: 0,
			},
			Width:   800,
			Height:  800,
			Content: "settings",
			Author:  "D'art",
			Time:    time.Now(),
			Color:   "#a380db",
		}
		_, err := collection.InsertOne(context.Background(), document)
		if err != nil {
			log.Println("Error inserting document:", err)
		} else {
			fmt.Println("Document inserted: settings")
		}
		room, ok := rooms[models.Coords{X: 0, Y: 0}]
		if !ok {
			room = &models.Room{Coords: models.Coords{X: 0, Y: 0}}
			rooms[models.Coords{X: 0, Y: 0}] = room
		}
		rooms[models.Coords{X: 0, Y: 0}].Zones = append(rooms[models.Coords{X: 0, Y: 0}].Zones, document)
	} else if err != nil {
		log.Println("Error finding document:", err)
	}

	filter = bson.M{"id": ".info"}
	a := []string{"info", "??????????", "D'art"}
	err = collection.FindOne(context.Background(), filter).Decode(&result)
	if err == mongo.ErrNoDocuments {
		// ?????? ??????????? ? ???? ??????
		document := models.Zone{
			ID: ".info",
			Coords: models.Coords{
				X: 0,
				Y: 0,
			},
			Room: models.Coords{
				X: 0,
				Y: 0,
			},
			Width:   800,
			Height:  800,
			Content: "info",
			Author:  "D'art",
			Time:    time.Now(),
			Color:   "#a380db",
			Tags:    a,
		}
		_, err := collection.InsertOne(context.Background(), document)
		if err != nil {
			log.Println("Error inserting document:", err)
		} else {
			fmt.Println("Document inserted: info")
		}
		room, ok := rooms[models.Coords{X: 0, Y: 0}]
		if !ok {
			room = &models.Room{Coords: models.Coords{X: 0, Y: 0}}
			rooms[models.Coords{X: 0, Y: 0}] = room
		}
		rooms[models.Coords{X: 0, Y: 0}].Zones = append(rooms[models.Coords{X: 0, Y: 0}].Zones, document)
	} else if err != nil {
		log.Println("Error finding document:", err)
	}

	r := mux.NewRouter()

	r.HandleFunc("/ws", authMiddleware(handleConnections))
	r.HandleFunc("/register", handleRegister).Methods("POST")
	r.HandleFunc("/login", handleLogin).Methods("POST")
	r.HandleFunc("/upload_image", uploadImageHandler).Methods("POST")
	r.HandleFunc("/upload_back", uploadBackHandler).Methods("POST")
	r.HandleFunc("/upload_ava", uploadAvaHandler).Methods("POST")

	currentDir, _ := os.Getwd()

	fs1 := http.FileServer(http.Dir(filepath.Join(currentDir, "images")))
	fs2 := http.FileServer(http.Dir(filepath.Join(currentDir, "backs")))
	fs3 := http.FileServer(http.Dir(filepath.Join(currentDir, "avas")))

	r.PathPrefix("/images/").Handler(http.StripPrefix("/images/", fs1))
	r.PathPrefix("/backs/").Handler(http.StripPrefix("/backs/", fs2))
	r.PathPrefix("/avas/").Handler(http.StripPrefix("/avas/", fs3))

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "DELETE", "PUT", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
	})

	handler := c.Handler(r)
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Could not upgrade", http.StatusInternalServerError)
		return
	}

	connections[conn] = &models.Connect{
		Connection: conn,
		Rooms:      make(map[models.Coords]*models.Room),
		Username:   username, // Store the username
	}

	go handleMessages(conn)
}

func getBlocksFromRoom(coords models.Coords) ([]models.Block, error) {
	var blocks []models.Block
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	collection := client.Database("chat").Collection("blocks")
	filter := bson.M{"room": coords}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var block models.Block
		if err = cursor.Decode(&block); err != nil {
			return nil, err
		}
		blocks = append(blocks, block)
	}
	if err = cursor.Err(); err != nil {
		return nil, err
	}
	return blocks, nil
}

func getZonesFromRoom(coords models.Coords) ([]models.Zone, error) {
	var zones []models.Zone
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	collection := client.Database("chat").Collection("zones")
	filter := bson.M{"room": coords}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var zone models.Zone
		if err = cursor.Decode(&zone); err != nil {
			return nil, err
		}
		zones = append(zones, zone)
	}
	if err = cursor.Err(); err != nil {
		return nil, err
	}
	return zones, nil
}

func handleMessages(conn *websocket.Conn) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Caught a panic: %v", r)
			deleteClient(conn)
		}
	}()
	for {
		var msg models.Message
		var adminMsg models.AdminMessage

		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("error occurred while reading message: %v", err)
			log.Printf("essss: %v", err)
			deleteClient(conn)
			return
		}

		author := connections[conn].Username
		isAdmin := (author == "D'art")

		if isAdmin && strings.Contains(msg.Type, "admin") {
			err := conn.ReadJSON(&adminMsg)
			if err != nil {
				log.Printf("error occurred while reading message: %v", err)
				log.Printf("essss: %v", err)
				deleteClient(conn)
				return
			}
			adminMsg.Time = time.Now()
		} else {
			msg.Author = author
			msg.Time = time.Now()
		}
		log.Printf("msg: %v", msg)
		log.Printf("adminMsg: %v", adminMsg)

		switch msg.Type {
		case "mylikes":
			collection := client.Database("chat").Collection("users")
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			result := collection.FindOne(ctx, bson.M{"username": author})
			dbUser := &models.User{}
			err = result.Decode(dbUser)

			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				deleteClient(conn)
				break
			}

			likes := dbUser.Likes
			message := models.LikeMessage{
				Type:  "mylikes",
				Likes: likes,
			}
			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}

		case "addpattern":
			puttern := models.Pattern{
				HTML:    msg.HTML,
				Author:  author,
				Content: msg.Content,
				Type:    "usual",
			}
			log.Printf("a")

			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("patterns")
			log.Printf("b")

			result := collection.FindOne(ctx, bson.M{"content": puttern.Content})
			existingUser := &models.User{}
			err = result.Decode(existingUser)
			if err != mongo.ErrNoDocuments {
				log.Printf("sssssss")
				deleteClient(conn)
				break
			}
			log.Printf("c")

			res, err := collection.InsertOne(ctx, puttern)

			if err != nil {
				log.Printf("error occurred while saving message: %v", err)
				deleteClient(conn)
				log.Printf("ffffffffffff")
				break
			}

			log.Printf("d")

			puttern.ID = res.InsertedID.(primitive.ObjectID).Hex()
			log.Printf(puttern.ID)

			filter := bson.M{"_id": res.InsertedID}
			update := bson.D{{Key: "$set", Value: bson.D{{Key: "id", Value: puttern.ID}}}}
			_, err = collection.UpdateOne(ctx, filter, update)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				deleteClient(conn)
				break
			}
			log.Printf("e")

		case "deletepattern":
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("patterns")
			filter := bson.M{"id": msg.ID}
			_, err := collection.DeleteOne(ctx, filter)
			if err != nil {
				log.Printf("error occurred while deleting block: %v", err)
				deleteClient(conn)
				break
			}
			log.Printf("aaaa")
			collection = client.Database("chat").Collection("users")
			filter = bson.M{}
			update := bson.M{"$pull": bson.M{"likes": bson.M{"id": msg.ID}}}
			_, err = collection.UpdateMany(ctx, filter, update)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				deleteClient(conn)
				return
			}

		case "givepatterns":
			searchInput := msg.Content
			collection := client.Database("chat").Collection("patterns")

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			filter := bson.M{
				"$or": bson.A{
					bson.M{"content": bson.M{
						"$regex": primitive.Regex{Pattern: searchInput, Options: "i"},
					}},
					bson.M{"author": bson.M{
						"$regex": primitive.Regex{Pattern: searchInput, Options: "i"},
					}},
				},
			}

			opts := options.Find().SetLimit(40) // ???????????? ????? ?? 100 ??????????

			var results []models.Pattern

			cursor, err := collection.Find(ctx, filter, opts)
			if err != nil {
				log.Printf("error occurred while finding zones: %v", err)
				deleteClient(conn)
				break
			}

			if err := cursor.All(ctx, &results); err != nil {
				log.Printf("error occurred while reading zones: %v", err)
				deleteClient(conn)
				break
			}

			message := models.PatternMessage{
				Type:     "givepatterns",
				Patterns: results,
			}

			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}
		case "popularpatterns":
			collection := client.Database("chat").Collection("patterns")
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			opts := options.Find()
			opts.SetSort(bson.D{{Key: "id", Value: -1}})
			opts.SetLimit(100)

			var results []models.Pattern

			cursor, err := collection.Find(ctx, bson.D{}, opts)
			if err != nil {
				log.Printf("error occurred while finding zones: %v", err)
				deleteClient(conn)
				break
			}

			if err := cursor.All(ctx, &results); err != nil {
				log.Printf("error occurred while reading zones: %v", err)
				deleteClient(conn)
				break
			}

			message := models.PatternMessage{
				Type:     "givepatterns",
				Patterns: results,
			}

			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}

		case "likepattern":
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("users")
			filter := bson.M{"username": author}
			updatez := bson.M{"$push": bson.M{"likes": msg.ID}}
			_, err = collection.UpdateOne(ctx, filter, updatez)
			if err != nil {
				log.Printf("?error occurred while updating message: %v", err)
				deleteClient(conn)
				break
			}
			collection = client.Database("chat").Collection("patterns")
			filter = bson.M{"id": msg.ID}
			update1 := bson.D{{Key: "$inc", Value: bson.D{{Key: "likes", Value: 1}}}}
			_, err := collection.UpdateOne(ctx, filter, update1)
			if err != nil {
				log.Printf("error occurred while?? updating message: %v", err)
				break
			}

		case "unlikepattern":
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("users")
			filter := bson.M{"author": author}
			update := bson.M{"$pull": bson.M{"likes": msg.ID}}
			_, err = collection.UpdateOne(ctx, filter, update)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				deleteClient(conn)
				break
			}
			collection = client.Database("chat").Collection("patterns")
			filter = bson.M{"id": msg.ID}
			update1 := bson.D{{Key: "$inc", Value: bson.D{{Key: "likes", Value: -1}}}}
			_, err := collection.UpdateOne(ctx, filter, update1)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				break
			}

		case "askforzones":
			searchInput := msg.Content
			collection := client.Database("chat").Collection("zones")

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			filter := bson.M{
				"$or": []bson.M{
					{"content": bson.M{"$regex": primitive.Regex{Pattern: searchInput, Options: "i"}}},
					{"tags": bson.M{"$regex": primitive.Regex{Pattern: searchInput, Options: "i"}}},
				},
			}

			opts := options.Find().SetLimit(40) // ???????????? ????? ?? 100 ??????????

			var results []models.Zone

			cursor, err := collection.Find(ctx, filter, opts)
			if err != nil {
				log.Printf("error occurred while finding zones: %v", err)
				deleteClient(conn)
				break
			}

			if err := cursor.All(ctx, &results); err != nil {
				log.Printf("error occurred while reading zones: %v", err)
				deleteClient(conn)
				break
			}

			zones := make([]models.ZoneLite, len(results))
			for i, result := range results {
				zones[i] = models.ZoneLite{
					Content: result.Content,
					ID:      result.ID,
					Coords:  result.Coords,
				}
			}

			message := models.ZoneLiteMessage{
				Type:  "searchzones",
				Zones: zones,
			}

			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}
		case "tpto":
			collection := client.Database("chat").Collection("zones")
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			result := collection.FindOne(ctx, bson.M{"id": msg.ID})
			dbZone := &models.ZoneLite{}
			err = result.Decode(dbZone)

			zones := make([]models.ZoneLite, 1)
			zones[0] = models.ZoneLite{
				Content: dbZone.Content,
				ID:      dbZone.ID,
				Coords:  dbZone.Coords,
			}

			message := models.ZoneLiteMessage{
				Type:  "tpto",
				Zones: zones,
			}

			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}

		case "myzones":
			collection := client.Database("chat").Collection("users")
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			result := collection.FindOne(ctx, bson.M{"username": author})
			dbUser := &models.User{}
			err = result.Decode(dbUser)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				deleteClient(conn)
				break
			}
			myZones := dbUser.MyZones
			message := models.ZoneLiteMessage{
				Type:  "myzones",
				Zones: myZones,
			}
			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}
		case "litezones":
			collection := client.Database("chat").Collection("users")
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			result := collection.FindOne(ctx, bson.M{"username": author})
			dbUser := &models.User{}
			err = result.Decode(dbUser)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				deleteClient(conn)
				break
			}
			zones := dbUser.Zones
			message := models.ZoneLiteMessage{
				Type:  "litezones",
				Zones: zones,
			}
			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}

		case "add":
			room, joined := rooms[msg.Room]
			if !joined {
				conn.WriteJSON(map[string]string{"error": "you are not in the room"})
				deleteClient(conn)
				break
			}
			log.Printf("q")
			block := models.Block{
				Room:   msg.Room,
				Coords: msg.Coords,
				Width:  msg.Width,
				Height: msg.Height,
				HTML:   msg.HTML,
				Time:   msg.Time,
				Author: msg.Author,
				Type:   msg.TypeBlock,
			}
			rms := []*models.Room{}
			log.Printf("qwff")
			coords := []models.Coords{
				{X: msg.Room.X - 1, Y: msg.Room.Y - 1},
				{X: msg.Room.X - 1, Y: msg.Room.Y},
				{X: msg.Room.X - 1, Y: msg.Room.Y + 1},
				{X: msg.Room.X, Y: msg.Room.Y - 1},
				{X: msg.Room.X, Y: msg.Room.Y},
				{X: msg.Room.X, Y: msg.Room.Y + 1},
				{X: msg.Room.X + 1, Y: msg.Room.Y - 1},
				{X: msg.Room.X + 1, Y: msg.Room.Y},
				{X: msg.Room.X + 1, Y: msg.Room.Y + 1}}

			log.Printf("qgrrrrrrrrrrra")
			for _, coord := range coords {
				if room, ok := rooms[coord]; ok {
					rms = append(rms, room)
				}
			}
			log.Printf("ilyuuk454545q")
			con := true
			for _, rm := range rms {
				if !addToZoneAdd(rm, block, author, conn) {
					con = false
					break
				}
			}
			if isAdmin {
				con = true
			}
			if con {
				log.Printf("qagrrrrrrrrrgggrrrrrrrrrrrrrrrvvvvvvvvvvvvvvvvvvvv")
				ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
				collection := client.Database("chat").Collection("blocks")
				res, err := collection.InsertOne(ctx, block)

				if err != nil {
					log.Printf("error occurred while saving message: %v", err)
					deleteClient(conn)
					break
				}

				block.ID = res.InsertedID.(primitive.ObjectID).Hex()
				msg.ID = block.ID

				filter := bson.M{"_id": res.InsertedID}
				update := bson.D{{Key: "$set", Value: bson.D{{Key: "id", Value: block.ID}}}}
				_, err = collection.UpdateOne(ctx, filter, update)
				if err != nil {
					log.Printf("error occurred while updating message: %v", err)
					deleteClient(conn)
					break
				}

				room.Blocks = append(room.Blocks, block)
				broadcastMessageToRoom(room, msg)
			}

		case "join":
			room, ok := rooms[msg.Room]
			if !ok {
				room = &models.Room{Coords: msg.Room}
				rooms[msg.Room] = room
			}
			room = rooms[msg.Room]
			// Check if user has already joined the room
			errcheck := false
			for _, client := range room.Clients {
				if client == conn {
					log.Printf("you already in the room: %v", room)
					break
				}
			}
			room.Clients = append(room.Clients, conn)
			connections[conn].Rooms[msg.Room] = room

			// Get all messages from the room
			blocks, err := getBlocksFromRoom(msg.Room)
			if err != nil {
				log.Printf("error occurred while getting blocks: %v", err)
				deleteClient(conn)
				break
			}
			zones, err := getZonesFromRoom(msg.Room)
			if err != nil {
				log.Printf("error occurred while getting blocks: %v", err)
				deleteClient(conn)
				break
			}
			// Send all messages to the client
			for _, block := range blocks {
				message := models.Message{
					ID:        block.ID,
					Type:      "add",
					Room:      block.Room,
					Coords:    block.Coords,
					Width:     block.Width,
					Height:    block.Height,
					HTML:      block.HTML,
					Time:      block.Time,
					Author:    block.Author,
					TypeBlock: block.Type,
				}
				if err = conn.WriteJSON(message); err != nil {
					log.Printf("error occurred while writing message to client: %v", err)
					conn.Close()
					deleteClient(conn)
					errcheck = true
				}
			}
			if errcheck {
				break
			}
			for _, zone := range zones {
				message := models.Message{
					ID:      zone.ID,
					Type:    "addzone",
					Room:    zone.Room,
					Coords:  zone.Coords,
					Width:   zone.Width,
					Height:  zone.Height,
					Content: zone.Content,
					Time:    zone.Time,
					Author:  zone.Author,
					Color:   zone.Color,
					Tags:    zone.Tags,
				}
				if err = conn.WriteJSON(message); err != nil {
					log.Printf("error occurred while writing message to client: %v", err)
					conn.Close()
					deleteClient(conn)
					break
				}
			}

		case "leave":
			room, joined := rooms[msg.Room]
			if !joined {
				log.Printf("you are not in the room: %v", room)
				deleteClient(conn)
				break
			}
			room.Clients = removeClientFromRoom(room.Clients, conn)
			delete(connections[conn].Rooms, msg.Room)

		case "edit":
			room, joined := rooms[msg.Room]
			if !joined {
				conn.WriteJSON(map[string]string{"error": "you are not joined in the room"})
				deleteClient(conn)
				break
			}
			errcheck := false
			for i, block := range room.Blocks {
				if block.ID == msg.ID {
					blck := models.Block{
						ID:     block.ID,
						HTML:   block.HTML,
						Coords: msg.Coords,
						Width:  msg.Width,
						Height: msg.Height,
						Room:   block.Room,
						Author: block.Author,
						Zone:   block.Zone,
						Time:   block.Time,
					}
					rms := []*models.Room{}

					coords := []models.Coords{
						{X: msg.Room.X - 1, Y: msg.Room.Y - 1},
						{X: msg.Room.X - 1, Y: msg.Room.Y},
						{X: msg.Room.X - 1, Y: msg.Room.Y + 1},
						{X: msg.Room.X, Y: msg.Room.Y - 1},
						{X: msg.Room.X, Y: msg.Room.Y},
						{X: msg.Room.X, Y: msg.Room.Y + 1},
						{X: msg.Room.X + 1, Y: msg.Room.Y - 1},
						{X: msg.Room.X + 1, Y: msg.Room.Y},
						{X: msg.Room.X + 1, Y: msg.Room.Y + 1}}

					for _, coord := range coords {
						if room, ok := rooms[coord]; ok {
							rms = append(rms, room)
						}
					}

					log.Printf("[[[[[[[[[sukfyyyy]]]]]]]]]")

					con := true
					for _, rm := range rms {
						if !addToZone(rm, blck, author, conn) {
							con = false
							break
						}
					}
					log.Printf("ko;o;;k;k;")
					if isAdmin {
						con = true
					}
					if con {

						broadcastMessageToRoomWithoutAuthor(room, msg, conn)
						log.Printf("265555555555bvgbvgbvg")
						rooms[msg.Room].Blocks[i] = blck
						// Update message in database
						ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
						collection := client.Database("chat").Collection("blocks")
						filter := bson.M{"id": msg.ID}
						update := bson.D{{Key: "$set", Value: bson.D{
							{Key: "coords", Value: blck.Coords},
							{Key: "width", Value: blck.Width},
							{Key: "height", Value: blck.Height},
							{Key: "time", Value: blck.Time}}}}
						_, err := collection.UpdateOne(ctx, filter, update)
						if err != nil {
							log.Printf("error occurred while updating message: %v", err)
							deleteClient(conn)
							errcheck = true
						}
						break
					}
				}
			}
			if errcheck {
				break
			}
		case "toroom":
			fromRoom, joinedFrom := rooms[msg.FromRoom]
			toRoom, joinedTo := rooms[msg.Room]
			if !(joinedFrom || joinedTo) {
				conn.WriteJSON(map[string]string{"error": "you are not joined in the room"})
				deleteClient(conn)
				break
			}
			errcheck := false
			log.Printf("ebfrobrahebae: %v", fromRoom.Blocks)
			for i, block := range fromRoom.Blocks {

				if block.ID == msg.ID {

					blck := models.Block{
						ID:     block.ID,
						HTML:   block.HTML,
						Coords: msg.Coords,
						Width:  msg.Width,
						Height: msg.Height,
						Room:   msg.Room,
						Author: block.Author,
						Zone:   block.Zone,
						Time:   block.Time,
					}

					rms := []*models.Room{}

					coords := []models.Coords{
						{X: msg.Room.X - 1, Y: msg.Room.Y - 1},
						{X: msg.Room.X - 1, Y: msg.Room.Y},
						{X: msg.Room.X - 1, Y: msg.Room.Y + 1},
						{X: msg.Room.X, Y: msg.Room.Y - 1},
						{X: msg.Room.X, Y: msg.Room.Y},
						{X: msg.Room.X, Y: msg.Room.Y + 1},
						{X: msg.Room.X + 1, Y: msg.Room.Y - 1},
						{X: msg.Room.X + 1, Y: msg.Room.Y},
						{X: msg.Room.X + 1, Y: msg.Room.Y + 1},
						{X: msg.FromRoom.X - 1, Y: msg.FromRoom.Y - 1},
						{X: msg.FromRoom.X - 1, Y: msg.FromRoom.Y},
						{X: msg.FromRoom.X - 1, Y: msg.FromRoom.Y + 1},
						{X: msg.FromRoom.X, Y: msg.FromRoom.Y - 1},
						{X: msg.FromRoom.X, Y: msg.FromRoom.Y},
						{X: msg.FromRoom.X, Y: msg.FromRoom.Y + 1},
						{X: msg.FromRoom.X + 1, Y: msg.FromRoom.Y - 1},
						{X: msg.FromRoom.X + 1, Y: msg.FromRoom.Y},
						{X: msg.FromRoom.X + 1, Y: msg.FromRoom.Y + 1}}
					for _, coord := range coords {
						if room, ok := rooms[coord]; ok {
							rms = append(rms, room)
						}
					}
					log.Printf("sukfyyyy")

					rms = removeDuplicates(rms)

					con := true

					for _, rm := range rms {
						if !addToToRoom(rm, blck, author, conn) {
							con = false
							break
						}
					}

					log.Printf("n,n,n,n,n,n,n,n,n,n,n,n,")

					if isAdmin {
						con = true
					}

					if con {
						rooms[msg.Room].Blocks = append(toRoom.Blocks, blck)
						rooms[msg.FromRoom].Blocks = append(fromRoom.Blocks[:i], fromRoom.Blocks[i+1:]...)
						broadcastMessageToRoomWithoutAuthor(toRoom, msg, conn)

						msg.Type = "fromroom"
						broadcastMessageToRoomWithoutAuthor(fromRoom, msg, conn)
						log.Printf("78000000jhhhhhh")
						// Delete message from database
						ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
						collection := client.Database("chat").Collection("blocks")
						filter := bson.M{"id": msg.ID}
						update := bson.D{{Key: "$set", Value: bson.D{
							{Key: "room", Value: blck.Room},
							{Key: "coords", Value: blck.Coords},
							{Key: "width", Value: blck.Width},
							{Key: "height", Value: blck.Height},
							{Key: "time", Value: blck.Time}}}}
						_, err := collection.UpdateOne(ctx, filter, update)
						if err != nil {
							log.Printf("error occurred while updating message: %v", err)
							deleteClient(conn)
							log.Printf("tt")
							errcheck = true
						}
						log.Printf("rrr")
					}
					log.Printf("============================")
					break
				}
			}
			if errcheck {
				log.Printf("]]]]]]]]]]]]]]]]]]]]]]]")
				break
			}
			log.Printf("jnnnnnnnnnnnnnnnnnnnnnxdf")
			log.Printf("curRoom: %v", rooms[msg.Room].Coords)
			log.Printf("1: %v", rooms[msg.Room].Blocks)
			log.Printf("fromroom: %v", rooms[msg.FromRoom].Coords)
			log.Printf("2: %v", rooms[msg.FromRoom].Blocks)

		case "delete":
			room, joined := rooms[msg.Room]
			if !joined {
				conn.WriteJSON(map[string]string{"error": "you are not joined in the room"})
				deleteClient(conn)
				break
			}
			errcheck := false
			for i, block := range room.Blocks {
				if block.ID == msg.ID {
					if !isAdmin && block.Author != author {
						conn.WriteJSON(map[string]string{"error": "you are not the author of the block"})
						break
					}
					room.Blocks = append(room.Blocks[:i], room.Blocks[i+1:]...)
					broadcastMessageToRoom(room, msg)

					// Delete message from database
					ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
					collection := client.Database("chat").Collection("blocks")
					filter := bson.M{"id": msg.ID}
					_, err := collection.DeleteOne(ctx, filter)
					if err != nil {
						log.Printf("error occurred while deleting block: %v", err)
						deleteClient(conn)
						errcheck = true
						break
					}
					break
				}
			}
			if errcheck {
				break
			}

		case "addzone":
			room, joined := rooms[msg.Room]
			if !joined {
				conn.WriteJSON(map[string]string{"error": "you are not joined in the room"})
				deleteClient(conn)
				break
			}
			zone := models.Zone{
				Room:    msg.Room,
				Coords:  msg.Coords,
				Width:   msg.Width,
				Height:  msg.Height,
				Content: msg.Content,
				Time:    msg.Time,
				Author:  msg.Author,
				Color:   msg.Color,
				Tags:    msg.Tags,
			}
			rms := []*models.Room{}

			coords := []models.Coords{
				{X: msg.Room.X - 1, Y: msg.Room.Y - 1},
				{X: msg.Room.X - 1, Y: msg.Room.Y},
				{X: msg.Room.X - 1, Y: msg.Room.Y + 1},
				{X: msg.Room.X, Y: msg.Room.Y - 1},
				{X: msg.Room.X, Y: msg.Room.Y},
				{X: msg.Room.X, Y: msg.Room.Y + 1},
				{X: msg.Room.X + 1, Y: msg.Room.Y - 1},
				{X: msg.Room.X + 1, Y: msg.Room.Y},
				{X: msg.Room.X + 1, Y: msg.Room.Y + 1}}
			for _, coord := range coords {
				if room, ok := rooms[coord]; ok {
					rms = append(rms, room)
				}
			}

			con := true
			for _, rm := range rms {
				if !CheckZoneAdd(rm, zone) {
					log.Printf("a")
					con = false
				}
				if !addBlock(rm, zone) {
					log.Printf("b")
					con = false
				}
			}
			if con {
				ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
				collection := client.Database("chat").Collection("zones")
				res, err := collection.InsertOne(ctx, zone)

				if err != nil {
					log.Printf("error occurred while saving message: %v", err)
					deleteClient(conn)
					log.Printf("q")
					break
				}
				log.Printf("r")
				zone.ID = res.InsertedID.(primitive.ObjectID).Hex()
				msg.ID = zone.ID

				filter := bson.M{"_id": res.InsertedID}
				update := bson.D{{Key: "$set", Value: bson.D{{Key: "id", Value: zone.ID}}}}
				_, err = collection.UpdateOne(ctx, filter, update)
				if err != nil {
					log.Printf("?error occurred while updating message: %v", err)
					deleteClient(conn)
					break
				}
				zonelite := models.ZoneLite{
					ID:      msg.ID,
					Coords:  msg.Coords,
					Content: msg.Content,
				}
				// Update message in database
				collection = client.Database("chat").Collection("users")
				filter = bson.M{"username": author}
				updatez := bson.M{"$push": bson.M{"myzones": zonelite}}
				_, err = collection.UpdateOne(ctx, filter, updatez)
				if err != nil {
					log.Printf("?error occurred while updating message: %v", err)
					deleteClient(conn)
					break
				}
				result := collection.FindOne(ctx, bson.M{"username": author})
				dbUser := &models.User{}
				err = result.Decode(dbUser)
				if err != nil {
					log.Printf("?error occurred while updating message: %v", err)
					deleteClient(conn)
					break
				}
				myZones := dbUser.MyZones
				message := models.ZoneLiteMessage{
					Type:  "myzones",
					Zones: myZones,
				}
				if err = conn.WriteJSON(message); err != nil {
					log.Printf("?error occurred while writing message to client: %v", err)
					deleteClient(conn)
					break
				}
				if err != nil {
					// If an error occurs during FindOne, log it and return.
					log.Printf("?error occurred while checking the zone: %v", err)
					conn.WriteJSON(map[string]string{"error": "zone verification failed"})
					break
				}

				room.Zones = append(room.Zones, zone)
				broadcastMessageToRoom(room, msg)
			}

		case "updatecolors":
			log.Printf("updatecolors: %v", msg)
			// Update message in database
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("users")
			filter := bson.M{"username": author}
			update := bson.D{{Key: "$set", Value: bson.D{
				{Key: "color1", Value: msg.Color1},
				{Key: "color2", Value: msg.Color2}}}}
			_, err := collection.UpdateOne(ctx, filter, update)
			result := collection.FindOne(ctx, bson.M{"username": author})
			dbUser := &models.User{}
			err = result.Decode(dbUser)
			log.Printf("updateresult: %v", dbUser)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				deleteClient(conn)
				break
			}

		case "askcolors":
			log.Printf("askcolors: %v", msg)
			collection := client.Database("chat").Collection("users")
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			result := collection.FindOne(ctx, bson.M{"username": author})
			dbUser := &models.User{}
			err = result.Decode(dbUser)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				deleteClient(conn)
				break
			}
			message := models.Message{
				Type:   "askcolors",
				Color1: dbUser.Color1,
				Color2: dbUser.Color2,
			}
			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}
		case "subzone":
			zone := models.ZoneLite{
				ID:      msg.ID,
				Coords:  msg.Coords,
				Content: msg.Content,
			}
			// Update message in database
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("users")
			filter := bson.M{"username": author}
			update := bson.M{"$push": bson.M{"zones": zone}}
			_, err := collection.UpdateOne(ctx, filter, update)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				deleteClient(conn)
				break
			}

		case "leavezone":
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("users")
			filter := bson.M{"username": author}
			update := bson.M{"$pull": bson.M{"zones": bson.M{"id": msg.ID}}}
			_, err := collection.UpdateOne(ctx, filter, update)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				deleteClient(conn)
				return
			}
		case "updatecolor":
			room, joined := rooms[msg.Room]
			if !joined {
				conn.WriteJSON(map[string]string{"error": "you are not joined in the room"})
				deleteClient(conn)
				break
			}
			errcheck := false
			for _, zn := range room.Zones {
				if zn.ID == msg.ID {
					log.Printf("ff")
					if zn.Author != author {
						log.Printf(zn.Author)
						conn.WriteJSON(map[string]string{"error": "you are not the author of the block"})
						break
					}

					// Update message in database
					ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
					collection := client.Database("chat").Collection("zones")
					filter := bson.M{"id": msg.ID}
					update := bson.D{{Key: "$set", Value: bson.D{
						{Key: "color", Value: msg.Color}}}}
					_, err := collection.UpdateOne(ctx, filter, update)
					if err != nil {
						log.Printf("error occurred while updating message: %v", err)
						deleteClient(conn)
						errcheck = true
						break
					}
				} else {
					log.Printf(zn.ID)
				}
				break
			}
			if errcheck {
				break
			}

		case "editzone":
			room, joined := rooms[msg.Room]
			if !joined {
				conn.WriteJSON(map[string]string{"error": "you are not joined in the room"})
				deleteClient(conn)
				break
			}
			errcheck := false
			for i, zn := range room.Zones {
				if zn.ID == msg.ID {
					log.Printf("??????")
					if !isAdmin && zn.Author != author {
						conn.WriteJSON(map[string]string{"error": "you are not the author of the block"})
						break
					}
					zone := models.Zone{
						ID:      msg.ID,
						Room:    msg.Room,
						Coords:  msg.Coords,
						Width:   msg.Width,
						Height:  msg.Height,
						Content: msg.Content,
						Time:    msg.Time,
						Author:  msg.Author,
						Color:   msg.Color,
					}
					rms := []*models.Room{}

					coords := []models.Coords{
						{X: msg.Room.X - 1, Y: msg.Room.Y - 1},
						{X: msg.Room.X - 1, Y: msg.Room.Y},
						{X: msg.Room.X - 1, Y: msg.Room.Y + 1},
						{X: msg.Room.X, Y: msg.Room.Y - 1},
						{X: msg.Room.X, Y: msg.Room.Y},
						{X: msg.Room.X, Y: msg.Room.Y + 1},
						{X: msg.Room.X + 1, Y: msg.Room.Y - 1},
						{X: msg.Room.X + 1, Y: msg.Room.Y},
						{X: msg.Room.X + 1, Y: msg.Room.Y + 1}}
					for _, coord := range coords {
						if room, ok := rooms[coord]; ok {
							rms = append(rms, room)
						}
					}

					con := true

					log.Printf("move")
					log.Printf("zone check %v", zone)
					for _, rm := range rms {
						if !CheckZone(rm, zone, conn) {
							con = false
						}
					}

					if con {
						broadcastMessageToRoomWithoutAuthor(room, msg, conn)

						for _, rm := range rms {
							if !checkBlock(rm, zone) {
								errcheck = true
								break
							}
						}
						room.Zones[i].Content = msg.Content
						room.Zones[i].Coords = msg.Coords
						room.Zones[i].Width = msg.Width
						room.Zones[i].Height = msg.Height
						room.Zones[i].Time = msg.Time
						blck := room.Zones[i]

						log.Printf(msg.ID)

						// Update message in database
						ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
						collection := client.Database("chat").Collection("zones")
						filter := bson.M{"id": msg.ID}
						update := bson.D{{Key: "$set", Value: bson.D{
							{Key: "content", Value: blck.Content},
							{Key: "coords", Value: blck.Coords},
							{Key: "width", Value: blck.Width},
							{Key: "height", Value: blck.Height},
							{Key: "time", Value: blck.Time}}}}
						_, err := collection.UpdateOne(ctx, filter, update)
						if err != nil {
							log.Printf("error occurred while updating message: %v", err)
							deleteClient(conn)
							errcheck = true
							break
						}
						zonelite := models.ZoneLite{
							Content: msg.Content,
							Coords:  msg.Coords,
							ID:      msg.ID,
						}

						collection = client.Database("chat").Collection("users")

						update1 := bson.M{
							"$set": bson.M{"zones.$[elem]": zonelite},
						}

						arrayFilter := options.Update().SetArrayFilters(options.ArrayFilters{
							Filters: []interface{}{
								bson.M{"elem.id": msg.ID},
							},
						})

						_, err = collection.UpdateOne(ctx, bson.M{"zones.id": msg.ID}, update1, arrayFilter)
						if err != nil {
							log.Printf("error occurred while updating message: %v", err)
							deleteClient(conn)
							errcheck = true
						}
						update2 := bson.M{
							"$set": bson.M{"myzones.$[elem]": zonelite},
						}

						arrayFilter = options.Update().SetArrayFilters(options.ArrayFilters{
							Filters: []interface{}{
								bson.M{"elem.id": msg.ID},
							},
						})

						_, err = collection.UpdateOne(ctx, bson.M{"myzones.id": msg.ID}, update2, arrayFilter)
						if err != nil {
							log.Printf("error occurred while updating message: %v", err)
							deleteClient(conn)
							errcheck = true
						}
					}
					break
				}
			}
			if errcheck {
				break
			}
		case "zonetoroom":
			fromRoom, joinedFrom := connections[conn].Rooms[msg.FromRoom]
			toRoom, joinedTo := connections[conn].Rooms[msg.Room]
			if !(joinedFrom || joinedTo) {
				conn.WriteJSON(map[string]string{"error": "you are not joined in the room"})
				deleteClient(conn)
				break
			}
			errcheck := false
			for i, zn := range fromRoom.Zones {

				if zn.ID == msg.ID {
					if zn.Author != author {
						conn.WriteJSON(map[string]string{"error": "you are not the author of the zone"})
						errcheck = true
						break
					}
					zone := models.Zone{
						ID:      msg.ID,
						Room:    msg.Room,
						Coords:  msg.Coords,
						Width:   msg.Width,
						Height:  msg.Height,
						Content: msg.Content,
						Time:    msg.Time,
						Author:  msg.Author,
						Color:   msg.Color,
					}

					rms := []*models.Room{}

					coords := []models.Coords{
						{X: msg.Room.X - 1, Y: msg.Room.Y - 1},
						{X: msg.Room.X - 1, Y: msg.Room.Y},
						{X: msg.Room.X - 1, Y: msg.Room.Y + 1},
						{X: msg.Room.X, Y: msg.Room.Y - 1},
						{X: msg.Room.X, Y: msg.Room.Y},
						{X: msg.Room.X, Y: msg.Room.Y + 1},
						{X: msg.Room.X + 1, Y: msg.Room.Y - 1},
						{X: msg.Room.X + 1, Y: msg.Room.Y},
						{X: msg.Room.X + 1, Y: msg.Room.Y + 1},
						{X: msg.FromRoom.X - 1, Y: msg.FromRoom.Y - 1},
						{X: msg.FromRoom.X - 1, Y: msg.FromRoom.Y},
						{X: msg.FromRoom.X - 1, Y: msg.FromRoom.Y + 1},
						{X: msg.FromRoom.X, Y: msg.FromRoom.Y - 1},
						{X: msg.FromRoom.X, Y: msg.FromRoom.Y},
						{X: msg.FromRoom.X, Y: msg.FromRoom.Y + 1},
						{X: msg.FromRoom.X + 1, Y: msg.FromRoom.Y - 1},
						{X: msg.FromRoom.X + 1, Y: msg.FromRoom.Y},
						{X: msg.FromRoom.X + 1, Y: msg.FromRoom.Y + 1}}
					for _, coord := range coords {
						if room, ok := rooms[coord]; ok {
							rms = append(rms, room)
						}
					}

					rms = removeDuplicates(rms)

					con := true
					log.Printf("toroom")
					log.Printf("zone check %v", zone)
					for _, rm := range rms {
						if !CheckZoneForToRoom(rm, zone, conn) {
							con = false
						}
					}
					if con {

						toRoom.Zones = append(toRoom.Zones, zone)

						broadcastMessageToRoomWithoutAuthor(toRoom, msg, conn)

						msg.Type = "zonefromroom"

						fromRoom.Zones = append(fromRoom.Zones[:i], fromRoom.Zones[i+1:]...)

						broadcastMessageToRoomWithoutAuthor(fromRoom, msg, conn)

						for _, rm := range rms {
							if !checkBlock(rm, zone) {
								errcheck = true
								break
							}
						}

						ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
						collection := client.Database("chat").Collection("zones")
						filter := bson.M{"id": msg.ID}
						update := bson.D{{Key: "$set", Value: bson.D{
							{Key: "room", Value: zone.Room},
							{Key: "content", Value: zone.Content},
							{Key: "coords", Value: zone.Coords},
							{Key: "width", Value: zone.Width},
							{Key: "height", Value: zone.Height},
							{Key: "author", Value: zone.Author},
							{Key: "time", Value: zone.Time}}}}
						_, err := collection.UpdateOne(ctx, filter, update)
						if err != nil {
							log.Printf("error occurred while updating message: %v", err)
							deleteClient(conn)
							errcheck = true
							break
						}
						zonelite := models.ZoneLite{
							Content: msg.Content,
							Coords:  msg.Coords,
							ID:      msg.ID,
						}

						collection = client.Database("chat").Collection("users")

						update1 := bson.M{
							"$set": bson.M{"zones.$[elem]": zonelite},
						}

						arrayFilter := options.Update().SetArrayFilters(options.ArrayFilters{
							Filters: []interface{}{
								bson.M{"elem.id": msg.ID},
							},
						})

						_, err = collection.UpdateOne(ctx, bson.M{"zones.id": msg.ID}, update1, arrayFilter)
						if err != nil {
							log.Printf("error occurred while updating message: %v", err)
							deleteClient(conn)
							errcheck = true
						}
						update2 := bson.M{
							"$set": bson.M{"myzones.$[elem]": zonelite},
						}

						arrayFilter = options.Update().SetArrayFilters(options.ArrayFilters{
							Filters: []interface{}{
								bson.M{"elem.id": msg.ID},
							},
						})

						_, err = collection.UpdateOne(ctx, bson.M{"myzones.id": msg.ID}, update2, arrayFilter)
						if err != nil {
							log.Printf("error occurred while updating message: %v", err)
							deleteClient(conn)
							errcheck = true
						}
						break
					}
				}
			}
			if errcheck {
				break
			}

		case "deletezone":
			room, joined := connections[conn].Rooms[msg.Room]
			if !joined {
				conn.WriteJSON(map[string]string{"error": "you are not joined in the room"})
				break
			}
			log.Printf("aaaaaaaaaaa")
			errcheck := false
			for i, zone := range room.Zones {
				log.Printf("aaaeeee")
				if zone.ID == msg.ID {
					if zone.Author != author {
						conn.WriteJSON(map[string]string{"error": "you are not the author of the zone"})
						errcheck = true
						break
					}

					rms := []*models.Room{}

					coords := []models.Coords{
						{X: msg.Room.X - 1, Y: msg.Room.Y - 1},
						{X: msg.Room.X - 1, Y: msg.Room.Y},
						{X: msg.Room.X - 1, Y: msg.Room.Y + 1},
						{X: msg.Room.X, Y: msg.Room.Y - 1},
						{X: msg.Room.X, Y: msg.Room.Y},
						{X: msg.Room.X, Y: msg.Room.Y + 1},
						{X: msg.Room.X + 1, Y: msg.Room.Y - 1},
						{X: msg.Room.X + 1, Y: msg.Room.Y},
						{X: msg.Room.X + 1, Y: msg.Room.Y + 1}}

					for _, coord := range coords {
						if room, ok := rooms[coord]; ok {
							rms = append(rms, room)
						}
					}

					for _, rm := range rms {
						if !deleteBlock(rm, zone) {
							errcheck = true
							break
						}
					}
					room.Zones = append(room.Zones[:i], room.Zones[i+1:]...)
					broadcastMessageToRoom(room, msg)

					ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
					collection := client.Database("chat").Collection("zones")
					filter := bson.M{"id": msg.ID}
					_, err := collection.DeleteOne(ctx, filter)
					if err != nil {
						log.Printf("error occurred while deleting block: %v", err)
						deleteClient(conn)
						errcheck = true
						break
					}
					collection = client.Database("chat").Collection("users")
					filter = bson.M{}
					update := bson.M{"$pull": bson.M{"zones": bson.M{"id": msg.ID}}}
					_, err = collection.UpdateMany(ctx, filter, update)
					if err != nil {
						log.Printf("error occurred while updating message: %v", err)
						deleteClient(conn)
						errcheck = true
						break
					}
					update = bson.M{"$pull": bson.M{"myzones": bson.M{"id": msg.ID}}}
					_, err = collection.UpdateMany(ctx, filter, update)
					if err != nil {
						log.Printf("error occurred while updating message: %v", err)
						deleteClient(conn)
						errcheck = true
						break
					}
					collection = client.Database("chat").Collection("blocks")
					filter = bson.M{"zone": msg.ID}
					update = bson.M{"zone": ""}
					_, err = collection.UpdateMany(ctx, filter, update)
					if err != nil {
						log.Printf("error occurred while updating message: %v", err)
						deleteClient(conn)
						errcheck = true
						break
					}
					break
				}
			}
			if errcheck {
				break
			}
		case "admin_get_blocks":

			log.Printf("yeeeeeh!!!blocks")
			var blocks []*models.Block

			collection := client.Database("chat").Collection("blocks")

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			filter := bson.M{
				"html":   bson.M{"$regex": primitive.Regex{Pattern: adminMsg.Content, Options: "i"}},
				"author": bson.M{"$regex": primitive.Regex{Pattern: adminMsg.Author, Options: "i"}},
				"id":     bson.M{"$regex": primitive.Regex{Pattern: adminMsg.ID, Options: "i"}},
				"zone":   bson.M{"$regex": primitive.Regex{Pattern: adminMsg.Zone, Options: "i"}},
			}

			if adminMsg.RoomXMin != "" && adminMsg.RoomXMax != "" {
				filter["room.x"] = bson.M{"$gte": adminMsg.RoomXMin, "$lte": adminMsg.RoomXMax}
			} else {
				if adminMsg.RoomXMin != "" {
					filter["room.x"] = bson.M{"$gte": adminMsg.RoomXMin}
				}
				if adminMsg.RoomXMax != "" {
					filter["room.x"] = bson.M{"$lte": adminMsg.RoomXMax}
				}
			}

			if adminMsg.RoomYMin != "" && adminMsg.RoomYMax != "" {
				filter["room.x"] = bson.M{"$gte": adminMsg.RoomYMin, "$lte": adminMsg.RoomYMax}
			} else {
				if adminMsg.RoomYMin != "" {
					filter["room.y"] = bson.M{"$gte": adminMsg.RoomYMin}
				}
				if adminMsg.RoomYMax != "" {
					filter["room.y"] = bson.M{"$lte": adminMsg.RoomYMax}
				}
			}

			log.Printf("filter block: %v", filter)

			// ????????? ?????? ? ???? ?????? ? ?????? ???????
			cur, err := collection.Find(ctx, filter, &options.FindOptions{
				Limit: &adminMsg.Limit,
				Skip:  &adminMsg.Skip,
			})
			if err != nil {
				log.Fatal(err)
			}

			// ????????? ??????????? ??????? ? ?????????? ????? blocks
			for cur.Next(ctx) {
				var block models.Block
				if err := cur.Decode(&block); err != nil {
					log.Printf("error decoding block: %v", err)
					continue
				}
				blocks = append(blocks, &block)
			}

			// ???????? ?????? ????? ?????????? ?????
			if err := cur.Err(); err != nil {
				log.Fatal(err)
			}

			message := models.BlocksMessage{
				Type:   "admin_get_blocks",
				Blocks: blocks,
			}
			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}

		case "admin_get_zones":
			log.Printf("yeeeeeh!!!zones")
			var zones []*models.Zone

			collection := client.Database("chat").Collection("zones")

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			filter := bson.M{
				"id":      bson.M{"$regex": primitive.Regex{Pattern: adminMsg.ID, Options: "i"}},
				"author":  bson.M{"$regex": primitive.Regex{Pattern: adminMsg.Author, Options: "i"}},
				"content": bson.M{"$regex": primitive.Regex{Pattern: adminMsg.Content, Options: "i"}},
			}

			if adminMsg.RoomXMin != "" && adminMsg.RoomXMax != "" {
				filter["room.x"] = bson.M{"$gte": adminMsg.RoomXMin, "$lte": adminMsg.RoomXMax}
			} else {
				if adminMsg.RoomXMin != "" {
					filter["room.x"] = bson.M{"$gte": adminMsg.RoomXMin}
				}
				if adminMsg.RoomXMax != "" {
					filter["room.x"] = bson.M{"$lte": adminMsg.RoomXMax}
				}
			}

			if adminMsg.RoomYMin != "" && adminMsg.RoomYMax != "" {
				filter["room.x"] = bson.M{"$gte": adminMsg.RoomYMin, "$lte": adminMsg.RoomYMax}
			} else {
				if adminMsg.RoomYMin != "" {
					filter["room.y"] = bson.M{"$gte": adminMsg.RoomYMin}
				}
				if adminMsg.RoomYMax != "" {
					filter["room.y"] = bson.M{"$lte": adminMsg.RoomYMax}
				}
			}

			log.Printf("filter zone: %v", filter)

			// ????????? ?????? ? ???? ?????? ? ?????? ???????
			cur, err := collection.Find(context.TODO(), filter, &options.FindOptions{
				Limit: &adminMsg.Limit,
				Skip:  &adminMsg.Skip,
			})
			if err != nil {
				log.Fatal(err)
			}

			// ????????? ?? ??????????? ??????? ? ????????? ????? ? ??????
			for cur.Next(ctx) {
				var zone models.Zone
				if err := cur.Decode(&zone); err != nil {
					log.Printf("error decoding zone: %v", err)
					continue
				}
				zones = append(zones, &zone)
			}

			if err != nil {
				log.Fatal(err)
			}

			message := models.ZonesMessage{
				Type:  "admin_get_zones",
				Zones: zones,
			}
			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}

		case "admin_get_users":
			log.Printf("yeeeeeh!!!users")
			var users []*models.User

			collection := client.Database("chat").Collection("zones")

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			filter := bson.M{
				"id":       bson.M{"$regex": primitive.Regex{Pattern: adminMsg.ID, Options: "i"}},
				"username": bson.M{"$regex": primitive.Regex{Pattern: adminMsg.Content, Options: "i"}},
				"likes":    bson.M{"$regex": primitive.Regex{Pattern: adminMsg.Zone, Options: "i"}},
			}

			log.Printf("user filter: %v", filter)

			// ????????? ?????? ? ???? ?????? ? ?????? ???????
			cur, err := collection.Find(context.TODO(), filter, &options.FindOptions{
				Limit: &adminMsg.Limit,
				Skip:  &adminMsg.Skip,
			})
			if err != nil {
				log.Fatal(err)
			}

			for cur.Next(ctx) {
				var user models.User
				if err := cur.Decode(&user); err != nil {
					log.Printf("error decoding user: %v", err)
					continue
				}
				users = append(users, &user)
			}

			if err != nil {
				log.Fatal(err)
			}

			message := models.UsersMessage{
				Type:  "admin_get_users",
				Users: users,
			}
			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}

		case "admin_get_rooms":
			log.Printf("yeeeeeh!!!rooms")
			var filteredRooms []*models.Room

			for _, room := range rooms {
				minX, _ := strconv.ParseFloat(adminMsg.RoomXMin, 64)
				maxX, _ := strconv.ParseFloat(adminMsg.RoomXMin, 64)
				minY, _ := strconv.ParseFloat(adminMsg.RoomYMin, 64)
				maxY, _ := strconv.ParseFloat(adminMsg.RoomYMax, 64)
				// ?????????, ????????????? ?? ?????????? ??????? ????????? ??????????
				if room.Coords.X >= minX && room.Coords.X <= maxX &&
					room.Coords.Y >= minY && room.Coords.Y <= maxY {
					filteredRooms = append(filteredRooms, room)
				}
			}

			log.Printf("rooms x: %v", filteredRooms)

			message := models.RoomsMessage{
				Type:  "admin_get_rooms",
				Rooms: filteredRooms,
			}
			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}
		case "admin_get_connections":
			log.Printf("yeeeeeh!!!connections")
			conns := len(connections)
			message := models.ConnectionsMessage{
				Type:        "admin_get_connections",
				Connections: conns,
			}
			if err = conn.WriteJSON(message); err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				deleteClient(conn)
				break
			}
		case "edituser":
			log.Printf("1!!!connections")
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("users")

			result := collection.FindOne(ctx, bson.M{"username": msg.ID})
			existingUser := &models.User{}
			err = result.Decode(existingUser)
			log.Printf("2!!!connections")
			if err == mongo.ErrNoDocuments || existingUser.Username == msg.Author || isAdmin {

				log.Printf("existingUser: %v", existingUser)

				filter := bson.M{"username": msg.Author}
				hashedPassword, err := bcrypt.GenerateFromPassword([]byte(msg.Content), bcrypt.DefaultCost)
				if err != nil {
					log.Printf("sssss: %v", err)
					return
				}
				update := bson.D{{Key: "$set", Value: bson.D{
					{Key: "username", Value: msg.ID},
					{Key: "password", Value: string(hashedPassword)}}}}
				_, err = collection.UpdateOne(ctx, filter, update)

				connections[conn].Username = msg.ID

				result = collection.FindOne(ctx, bson.M{"username": msg.ID})
				editedUser := &models.User{}
				err = result.Decode(editedUser)

				log.Printf("editedUser: %v", editedUser)
				if err != nil {
					log.Printf("error occurred while updating message: %v", err)
					deleteClient(conn)
					break
				}
				log.Printf("3!!!connections")
				message := models.UsernameMessage{
					Type:     "edituser",
					Username: msg.ID,
				}
				if err = conn.WriteJSON(message); err != nil {
					log.Printf("error occurred while writing message to client: %v", err)
					deleteClient(conn)
					break
				}
			}
		case "deleteuser":
			if msg.Author == msg.Content || isAdmin {
				ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)

				collection := client.Database("chat").Collection("zones")
				filter := bson.M{"author": msg.Content}

				// ???????? ???? ??????????, ??????????????? ???????
				_, err := collection.DeleteMany(ctx, filter)

				if err != nil {
					log.Printf("error occurred while deleting block: %v", err)
					deleteClient(conn)
					break
				}

				collection = client.Database("chat").Collection("users")
				filter = bson.M{"username": msg.Content}
				_, err = collection.DeleteOne(ctx, filter)
				if err != nil {
					log.Printf("error occurred while deleting block: %v", err)
					deleteClient(conn)
					break
				}
			}
		case "other":
			log.Printf("message content: %v", msg.Content)
		}
	}
}

func deleteBlock(room *models.Room, zone models.Zone) bool {
	for i, blck := range room.Blocks {
		if blck.Zone == zone.ID {
			room.Blocks[i].Zone = ""
			blck := room.Blocks[i]
			// Update message in database
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("blocks")
			filter := bson.M{"id": blck.ID}
			update := bson.D{{Key: "$set", Value: bson.D{
				{Key: "zone", Value: ""}}}}
			_, err := collection.UpdateOne(ctx, filter, update)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				return false
			}
		}
	}
	return true
}

func addBlock(room *models.Room, zone models.Zone) bool {
	for i, blck := range room.Blocks {
		if !(blck.Coords.X > zone.Coords.X+zone.Width ||
			blck.Coords.X+blck.Width < zone.Coords.X ||
			blck.Coords.Y > zone.Coords.Y+zone.Height ||
			blck.Coords.Y+blck.Height < zone.Coords.Y) {
			room.Blocks[i].Zone = zone.ID
			blck := room.Blocks[i]
			// Update message in database
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("blocks")
			filter := bson.M{"id": blck.ID}
			update := bson.D{{Key: "$set", Value: bson.D{
				{Key: "zone", Value: zone.ID}, {Key: "author", Value: zone.Author}}}}
			_, err := collection.UpdateOne(ctx, filter, update)
			if err != nil {
				log.Printf("error occurred sngwhile updating message: %v", err)
				return false
			}
		}
	}
	return true
}

func addToToRoom(room *models.Room, block models.Block, author string, conn *websocket.Conn) bool {
	log.Printf("jjjroom %v", room.Coords)

	for _, zn := range room.Zones {
		log.Printf(",,,zn test %v", zn)
		if !(zn.Coords.X > block.Coords.X+block.Width ||
			zn.Coords.X+zn.Width < block.Coords.X ||
			zn.Coords.Y > block.Coords.Y+block.Height ||
			zn.Coords.Y+zn.Height < block.Coords.Y) {

			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("blocks")
			filter := bson.M{"id": block.ID}

			if author == zn.Author {
				update := bson.D{{Key: "$set", Value: bson.D{
					{Key: "zone", Value: zn.ID}}}}
				_, err := collection.UpdateOne(ctx, filter, update)
				if err != nil {
					log.Printf("error occurred while updating message: %v", err)
					return false
				}
				log.Printf("1")
				return true
			} else {
				result := collection.FindOne(ctx, bson.M{"id": block.ID})
				dbBlock := &models.Block{}
				err := result.Decode(dbBlock)
				if err != nil {
					log.Printf("error occurred while updating message: %v", err)
					return false
				}
				mes := models.Message{
					Type:     "toroom",
					ID:       dbBlock.ID,
					Coords:   dbBlock.Coords,
					Width:    dbBlock.Width,
					Height:   dbBlock.Height,
					Room:     dbBlock.Room,
					FromRoom: block.Room,
				}
				log.Printf(zn.Content)
				log.Printf("ggg2")
				log.Printf("sss %v", dbBlock)
				conn.WriteJSON(mes)
				return false
			}
		}
	}
	return true
}

func addToZone(room *models.Room, block models.Block, author string, conn *websocket.Conn) bool {
	log.Printf("vroom %v", room.Coords)
	for _, zn := range room.Zones {
		log.Printf("xxzn test %v", zn)
		log.Printf("xxzn test %v", block)
		if !(zn.Coords.X > block.Coords.X+block.Width ||
			zn.Coords.X+zn.Width < block.Coords.X ||
			zn.Coords.Y > block.Coords.Y+block.Height ||
			zn.Coords.Y+zn.Height < block.Coords.Y) {
			log.Printf("/////////////")

			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("blocks")
			filter := bson.M{"id": block.ID}

			if author == zn.Author {
				update := bson.D{{Key: "$set", Value: bson.D{
					{Key: "zone", Value: zn.ID}}}}
				_, err := collection.UpdateOne(ctx, filter, update)
				if err != nil {
					log.Printf("error occurred while updating message: %v", err)
					return false
				}
				log.Printf("1ssssss")
				return true
			} else {
				result := collection.FindOne(ctx, bson.M{"id": block.ID})
				dbBlock := &models.Block{}
				err := result.Decode(dbBlock)
				if err != nil {
					log.Printf("error occurred while updating message: %v", err)
					return false
				}
				mes := models.Message{
					Type:   "edit",
					ID:     dbBlock.ID,
					Coords: dbBlock.Coords,
					Width:  dbBlock.Width,
					Height: dbBlock.Height,
					Room:   dbBlock.Room,
				}
				log.Printf(zn.Content)
				log.Printf("ggg2")
				log.Printf("sss %v", dbBlock)
				conn.WriteJSON(mes)
				return false
			}
		}
	}
	log.Printf("sgggssssss")
	return true
}

func addToZoneAdd(room *models.Room, block models.Block, author string, conn *websocket.Conn) bool {
	log.Printf("room %v", room.Coords)

	for _, zn := range room.Zones {
		log.Printf("ccczn test %v", zn)
		if !(zn.Coords.X > block.Coords.X+block.Width ||
			zn.Coords.X+zn.Width < block.Coords.X ||
			zn.Coords.Y > block.Coords.Y+block.Height ||
			zn.Coords.Y+zn.Height < block.Coords.Y) {

			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			collection := client.Database("chat").Collection("blocks")
			filter := bson.M{"id": block.ID}

			if author == zn.Author {
				update := bson.D{{Key: "$set", Value: bson.D{
					{Key: "zone", Value: zn.ID}}}}
				_, err := collection.UpdateOne(ctx, filter, update)
				if err != nil {
					log.Printf("error occurred while updating message: %v", err)
					return false
				}
				log.Printf("1xxxx")
				return true
			} else {
				return false
			}
		}
	}
	return true
}

func checkBlock(room *models.Room, zone models.Zone) bool {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := client.Database("chat").Collection("blocks")

	// Iterate over blocks in room
	for i, blck := range room.Blocks {
		// Check if block is in zone or its zone ID matches the zone
		if !(blck.Coords.X > zone.Coords.X+zone.Width ||
			blck.Coords.X+blck.Width < zone.Coords.X ||
			blck.Coords.Y > zone.Coords.Y+zone.Height ||
			blck.Coords.Y+blck.Height < zone.Coords.Y) {
			// Update block zone in room struct
			room.Blocks[i].Zone = zone.ID

			// Update block zone in database if it changed
			if blck.Zone != zone.ID {
				filter := bson.M{"id": blck.ID}
				update := bson.D{{Key: "$set", Value: bson.D{
					{Key: "zone", Value: zone.ID}, {Key: "author", Value: zone.Author}}}}
				_, err := collection.UpdateOne(ctx, filter, update)
				if err != nil {
					log.Printf("error occurred while updating message: %v", err)
					return false
				}
			}
		} else if blck.Zone == zone.ID {
			filter := bson.M{"id": blck.ID}
			update := bson.D{{Key: "$set", Value: bson.D{
				{Key: "zone", Value: ""}}}}
			_, err := collection.UpdateOne(ctx, filter, update)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				return false
			}
		}
	}

	return true
}

func CheckZoneAdd(room *models.Room, zone models.Zone) bool {
	for _, zn := range room.Zones {
		if zn.ID != zone.ID && !(zn.Coords.X > zone.Coords.X+zone.Width ||
			zn.Coords.X+zn.Width < zone.Coords.X ||
			zn.Coords.Y > zone.Coords.Y+zone.Height ||
			zn.Coords.Y+zn.Height < zone.Coords.Y) {
			log.Printf(zn.Content)
			return false
		}
	}
	return true
}

func CheckZone(room *models.Room, zone models.Zone, conn *websocket.Conn) bool {
	log.Printf("room %v", room.Coords)
	for _, zn := range room.Zones {
		log.Printf("zn test %v", zn)
		if zn.ID != zone.ID && !(zn.Coords.X > zone.Coords.X+zone.Width ||
			zn.Coords.X+zn.Width < zone.Coords.X ||
			zn.Coords.Y > zone.Coords.Y+zone.Height ||
			zn.Coords.Y+zn.Height < zone.Coords.Y) {
			collection := client.Database("chat").Collection("zones")
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			result := collection.FindOne(ctx, bson.M{"id": zone.ID})
			dbZone := &models.Zone{}
			err := result.Decode(dbZone)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				return false
			}
			mes := models.Message{
				Type:    "editzone",
				ID:      dbZone.ID,
				Coords:  dbZone.Coords,
				Width:   dbZone.Width,
				Height:  dbZone.Height,
				Room:    dbZone.Room,
				Content: dbZone.Content,
			}
			log.Printf(zn.Content)
			conn.WriteJSON(mes)
			return false
		}
	}
	return true
}

func CheckZoneForToRoom(room *models.Room, zone models.Zone, conn *websocket.Conn) bool {
	log.Printf("room %v", room.Coords)
	for _, zn := range room.Zones {
		log.Printf("zn test %v", zn)
		if zn.ID != zone.ID && !(zn.Coords.X > zone.Coords.X+zone.Width ||
			zn.Coords.X+zn.Width < zone.Coords.X ||
			zn.Coords.Y > zone.Coords.Y+zone.Height ||
			zn.Coords.Y+zn.Height < zone.Coords.Y) {

			collection := client.Database("chat").Collection("zones")
			ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
			result := collection.FindOne(ctx, bson.M{"id": zone.ID})
			dbZone := &models.Zone{}
			err := result.Decode(dbZone)
			if err != nil {
				log.Printf("error occurred while updating message: %v", err)
				return false
			}
			mes := models.Message{
				Type:     "zonetoroom",
				ID:       dbZone.ID,
				Coords:   dbZone.Coords,
				Width:    dbZone.Width,
				Height:   dbZone.Height,
				Room:     dbZone.Room,
				FromRoom: zone.Room,
				Content:  dbZone.Content,
			}
			log.Printf(zn.Content)
			conn.WriteJSON(mes)
			return false
		}
	}
	return true
}

func removeDuplicates(elements []*models.Room) []*models.Room {
	encountered := map[*models.Room]bool{} // ??????? ??? ???????????? ??????????? ?????????
	result := []*models.Room{}             // ?????????????? ?????? ??? ??????????

	for v := range elements {
		if encountered[elements[v]] != true {
			encountered[elements[v]] = true
			result = append(result, elements[v])
		}
	}

	return result
}

func removeClientFromRoom(clients []*websocket.Conn, conn *websocket.Conn) []*websocket.Conn {
	for i := range clients {
		if clients[i] == conn {
			return append(clients[:i], clients[i+1:]...)
		}
	}
	return clients
}

func deleteClient2(conn *websocket.Conn, room *models.Room) {
	if room == nil {
		return
	}

	for i, client := range room.Clients {
		if client == conn {
			room.Clients = append(room.Clients[:i], room.Clients[i+1:]...)
			break
		}
	}
}

func deleteClient(conn *websocket.Conn) {
	connRooms := connections[conn].Rooms
	for room := range connRooms {
		roomInArray := rooms[room]
		for i, client := range roomInArray.Clients {
			if client == conn {
				roomInArray.Clients = append(roomInArray.Clients[:i], roomInArray.Clients[i+1:]...)
				break
			}
		}
	}
	delete(connections, conn)
}

func broadcastMessageToRoom(room *models.Room, msg models.Message) {
	for _, client := range room.Clients {
		err := client.WriteJSON(msg)
		log.Printf("aaa")
		if err != nil {
			log.Printf("error occurred while writing message to client: %v", err)
			client.Close()
			deleteClient(client)
		}
	}
}

func broadcastMessageToRoomWithoutAuthor(room *models.Room, msg models.Message, auth *websocket.Conn) {
	for _, client := range room.Clients {
		if client != auth {
			log.Printf("bbb")
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				client.Close()
				deleteClient(client)
			}
		}
	}
}

func uploadImageHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)
	id := r.Header.Get("id")
	log.Printf(id)
	file, _, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Error uploading file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	imagePath := filepath.Join("images", id)
	dst, err := os.Create(imagePath)
	os.Create(imagePath)
	if err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()
	io.Copy(dst, file)
}

func uploadBackHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)
	id := r.Header.Get("id")
	log.Printf(id)
	file, _, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Error uploading file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	imagePath := filepath.Join("backs", id)
	dst, err := os.Create(imagePath)
	os.Create(imagePath)
	if err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()
	io.Copy(dst, file)
}

func uploadAvaHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)
	id := r.Header.Get("id")
	file, _, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Error uploading file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	imagePath := filepath.Join("avas", id)
	dst, err := os.Create(imagePath)
	os.Create(imagePath)
	if err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()
	io.Copy(dst, file)
}
