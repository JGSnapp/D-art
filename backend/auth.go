package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"backend/models"

	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	user := &models.User{
		MyZones: make([]models.ZoneLite, 0), // Создание пустого массива MyZones
		Zones:   make([]models.ZoneLite, 0), // Создание пустого массива Zones
		Likes:   make([]string, 0),
	}
	err := json.NewDecoder(r.Body).Decode(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	collection := client.Database("chat").Collection("users")
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)

	// Check if user already exists
	result := collection.FindOne(ctx, bson.M{"username": user.Username})
	existingUser := &models.User{}
	err = result.Decode(existingUser)
	if err != mongo.ErrNoDocuments {
		if err != nil {
			http.Error(w, "Error checking username", http.StatusInternalServerError)
			return
		}
		http.Error(w, "User already exists", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Could not hash password", http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword)

	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		http.Error(w, "Could not insert user", http.StatusInternalServerError)
		return
	}

	user.Password = ""
	json.NewEncoder(w).Encode(user)
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Parse and decode the request body into a new `User` instance
	user := &models.User{}
	err := json.NewDecoder(r.Body).Decode(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get user from database
	collection := client.Database("chat").Collection("users")
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	result := collection.FindOne(ctx, bson.M{"username": user.Username})
	dbUser := &models.User{}
	err = result.Decode(dbUser)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Compare the hashed password
	err = bcrypt.CompareHashAndPassword([]byte(dbUser.Password), []byte(user.Password))
	if err != nil {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// Create a new token
	token := jwt.New(jwt.SigningMethodHS256)

	// Set token claims
	claims := token.Claims.(jwt.MapClaims)
	claims["username"] = dbUser.Username
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix() // Token expires after 24 hours

	// Sign the token with our secret
	tokenString, err := token.SignedString([]byte("secret"))
	if err != nil {
		http.Error(w, "Could not sign token", http.StatusInternalServerError)
		return
	}

	// Prepare the response
	resp := map[string]string{"token": tokenString}

	// Encode the response as JSON
	err = json.NewEncoder(w).Encode(resp)
	if err != nil {
		http.Error(w, "Could not encode response", http.StatusInternalServerError)
		return
	}
}

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get token from the URL parameter 'token'
		params := r.URL.Query()
		tokenStrings, ok := params["token"]

		if !ok || len(tokenStrings[0]) < 1 {
			http.Error(w, "URL Param 'token' is missing", http.StatusBadRequest)
			return
		}
		tokenString := tokenStrings[0]

		if tokenString == "" {
			http.Error(w, "Authorization header is missing", http.StatusBadRequest)
			return
		}

		// Parse the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if jwt.GetSigningMethod("HS256") != token.Method {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte("secret"), nil
		})

		if err != nil {
			http.Error(w, "Invalid token", http.StatusBadRequest)
			return
		}

		if !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Parse the token to get the username
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		username, ok := claims["username"].(string)
		if !ok {
			http.Error(w, "Invalid username in token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "username", username)
		// If everything is OK, call the next handler
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
