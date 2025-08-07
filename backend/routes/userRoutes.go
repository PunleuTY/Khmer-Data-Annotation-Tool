package routes

// Uncommand for testing the Register function

// import (
// 	"backend/database"
// 	"backend/models"
// 	"encoding/json"
// 	"fmt"
// 	"net/http"

// 	"github.com/gorilla/mux"
// 	"golang.org/x/crypto/bcrypt"
// )

type RegisterRequest struct {
	FirstName       string `json:"first_name"`
	LastName        string `json:"last_name"`
	Email           string `json:"email"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirm_password"`
}

// For Testing the Register function

// func Register(w http.ResponseWriter, r *http.Request) {
// 	var req RegisterRequest
// 	err := json.NewDecoder(r.Body).Decode(&req)
// 	if err != nil {
// 		http.Error(w, "Invalid request", http.StatusBadRequest)
// 		return
// 	}

// 	if req.Password != req.ConfirmPassword {
// 		http.Error(w, "Passwords do not match", http.StatusBadRequest)
// 		return
// 	}

// 	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
// 	if err != nil {
// 		http.Error(w, "Error hashing password", http.StatusInternalServerError)
// 		return
// 	}

// 	user := models.User{
// 		FirstName: req.FirstName,
// 		LastName:  req.LastName,
// 		Email:     req.Email,
// 		Password:  string(hashedPassword),
// 	}

// 	if result := config.DB.Create(&user); result.Error != nil {
// 		http.Error(w, "Email already exists or DB error", http.StatusBadRequest)
// 		return
// 	}

// 	w.WriteHeader(http.StatusCreated)
// 	fmt.Fprintf(w, "User registered successfully")
// }

// func UserRoutes(r *mux.Router) {
// 	r.HandleFunc("/register", Register).Methods("POST")
// }
