package apiPython

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Struct for request
type PreRequest struct {
	Name string `json:"name"`
}

// Struct for response
type PreResponse struct {
	Message string `json:"message"`
}

var message string // global variable to store the message

func Login(c *gin.Context) {
	reqData := PreRequest{Name: "example_name"}
	jsonBytes, err := json.Marshal(reqData)
	if err != nil {
		fmt.Println("Error marshaling request:", err)
		return
	}

	// Send POST request to ML service
	resp, err := http.Post(
		"http://localhost:5000/pre",
		"application/json",
		bytes.NewBuffer(jsonBytes),
	)
	if err != nil {
		fmt.Println("Error sending POST request:", err)
		return
	}
	defer resp.Body.Close()

	// Read response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		return
	}

	// Parse JSON response
	var preResp PreResponse
	if err := json.Unmarshal(respBody, &preResp); err != nil {
		fmt.Println("Error unmarshaling response:", err)
		return
	}

	// Store message
	message = preResp.Message

	// Print values
	fmt.Println("PreRequest Name:", preResp.Message)
	fmt.Println("Raw Response:", string(respBody))

	c.JSON(http.StatusOK, gin.H{"message": message})
}

