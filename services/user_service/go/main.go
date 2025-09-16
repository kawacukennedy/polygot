package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

var startTime time.Time

func init() {
	startTime = time.Now()
}

func healthzHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	uptime := time.Since(startTime).Seconds()
	response := map[string]interface{}{
		"status": "ok",
		"uptime_seconds": uptime,
		"version": "1.0.0",
	}
	json.NewEncoder(w).Encode(response)
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "User Service Go\n")
}

func main() {
	http.HandleFunc("/healthz", healthzHandler)
	http.HandleFunc("/", rootHandler)

	port := ":8080"
	fmt.Printf("Server listening on port %s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
