package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	dbClient       *mongo.Client
	img_collection *mongo.Collection
	txt_collection *mongo.Collection
)

type ImageInfo struct {
	ID        string    `json:"id" bson:"id,omitempty"`
	Name      string    `json:"name" bson:"name,omitempty"`
	URL       string    `json:"url" bson:"url,omitempty"`
	Timestamp time.Time `json:"timestamp" bson:"timestamp,omitempty"`
}

type TextInfo struct {
	ID        string    `json:"id" bson:"id,omitempty"`
	Text      string    `json:"text" bson:"text,omitempty"`
	Colour    string    `json:"colour" bson:"colour,omitempty"`
	Timestamp time.Time `json:"timestamp" bson:"timestamp,omitempty"`
}

func uploadImageHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Println("sssssss")
    r.ParseMultipartForm(10 << 20) // Лимит размера файла до 10 МБ

    id := r.Header.Get("id")

    file, _, err := r.FormFile("image")
    if err != nil {
        http.Error(w, "Ошибка загрузки файла", http.StatusBadRequest)
        return
    }
    defer file.Close()
    fmt.Println("000000000000")

    // Используйте только id в качестве имени файла
    fileName := id
    imagePath := filepath.Join("images", fileName)
    dst, err := os.Create(imagePath)
    if err != nil {
        http.Error(w, "Ошибка сохранения файла", http.StatusInternalServerError)
        return
    }
    defer dst.Close()
    io.Copy(dst, file)

    var existingImage ImageInfo
    err = img_collection.FindOne(context.Background(), bson.M{"id": id}).Decode(&existingImage)
    if err == nil {
        fmt.Println("888888888888")
        existingImage.Name = fileName
        existingImage.URL = fmt.Sprintf("https://d-art.space/blocks/images/%s", fileName)
        existingImage.Timestamp = time.Now()

        _, err = img_collection.ReplaceOne(context.Background(), bson.M{"id": id}, existingImage)
        if err != nil {
            http.Error(w, "Ошибка обновления информации об изображении", http.StatusInternalServerError)
            return
        }
        json.NewEncoder(w).Encode(existingImage)
        return
    }
    log.Print(err)

    fmt.Println("4444444444")
    // Вставка информации об изображении в базу данных
    imageInfo := ImageInfo{
        ID:        id,
        Name:      fileName,
        URL:       fmt.Sprintf("https://d-art.space/blocks/images/%s", fileName),
        Timestamp: time.Now(),
    }
    _, err = img_collection.InsertOne(context.Background(), imageInfo)
    if err != nil {
        http.Error(w, "Ошибка сохранения информации об изображении", http.StatusInternalServerError)
        log.Print(err)
        return
    }
    fmt.Println("yagyuhgbiupqrhty9783478")

    json.NewEncoder(w).Encode(imageInfo)
}

func askForImageHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("3")
	id := r.Header.Get("id")
	fmt.Println("gyuhgyugygyuggui")

	var image ImageInfo
	err := img_collection.FindOne(context.Background(), bson.M{"id": id}).Decode(&image)
	if err != nil {
		http.Error(w, "Изображение не найдено", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(image)
}

func uploadTxtHandler(w http.ResponseWriter, r *http.Request) {
	var requestData map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	txtData := requestData["text"].(string)
	colourData := requestData["colour"].(string)
	id := requestData["id"].(string)

	fmt.Println("2")
	fmt.Println(colourData)
	fmt.Println(txtData)
	fmt.Println(id)

	var existingTxt TextInfo

	err = txt_collection.FindOne(context.Background(), bson.M{"id": id}).Decode(&existingTxt)
	if err == nil {
		fmt.Println("888888888888")
		existingTxt.Text = txtData
		existingTxt.Colour = colourData
		existingTxt.Timestamp = time.Now()

		_, err = txt_collection.ReplaceOne(context.Background(), bson.M{"id": id}, existingTxt)
		if err != nil {
			http.Error(w, "Ошибка обновления информации об изображении", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(existingTxt)
		return
	}
	log.Print(err)

	fmt.Println("2")
	fmt.Println(colourData)
	// Insert image info into the database
	textInfo := TextInfo{
		ID:        id,
		Text:      txtData,
		Colour:    colourData,
		Timestamp: time.Now(),
	}
	_, err = txt_collection.InsertOne(context.Background(), textInfo)
	if err != nil {
		http.Error(w, "Error saving image info", http.StatusInternalServerError)
		log.Print(err)
		return
	}
	fmt.Println("yagyuhgbiupqrhty9783478")

	json.NewEncoder(w).Encode(textInfo)
}

func askForTxtHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("1")
	var requestData map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	id := requestData["id"].(string)
	fmt.Println(id)
	var txt TextInfo
	err = txt_collection.FindOne(context.Background(), bson.M{"id": id}).Decode(&txt)
	if err != nil {
		http.Error(w, "Изображение не найдено", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(txt)
}

func main() {
	// Connect to MongoDB
	clientOptions := options.Client().ApplyURI("mongodb://root:example@mongo:27017")
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		fmt.Println("333Error connecting to MongoDB:", err)
		return
	}
	dbClient = client
	img_collection = client.Database("servicesdb").Collection("images")
	txt_collection = client.Database("servicesdb").Collection("txt")

	r := mux.NewRouter()

	r.HandleFunc("/upload_image", uploadImageHandler).Methods("POST")
	r.HandleFunc("/ask_image", askForImageHandler).Methods("POST")
	r.HandleFunc("/upload_txt", uploadTxtHandler).Methods("POST")
	r.HandleFunc("/ask_txt", askForTxtHandler).Methods("POST")
	currentDir, _ := os.Getwd()
	fs := http.FileServer(http.Dir(filepath.Join(currentDir, "images")))

	r.PathPrefix("/images/").Handler(http.StripPrefix("/images/", fs))

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "DELETE", "PUT", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
	})

	handler := c.Handler(r)
	log.Fatal(http.ListenAndServe(":7000", handler))
}
