
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/blevesearch/bleve"
	_ "github.com/lib/pq"
	"database/sql"
)

type Product struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
}

var index bleve.Index

func main() {
	var err error
	// Open a new index
	mapping := bleve.NewIndexMapping()
	index, err = bleve.NewMemOnly(mapping)
	if err != nil {
		log.Fatal(err)
	}
	defer index.Close()

	// Connect to the database to fetch products
	connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Index existing products
	rows, err := db.Query("SELECT id, title, description FROM products")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.Title, &p.Description); err != nil {
			log.Printf("Error scanning product: %v", err)
			continue
		}
		index.Index(p.ID, p)
	}
	log.Println("Finished indexing products")

	router := http.NewServeMux()
	router.HandleFunc("/healthz", healthzHandler)
	router.HandleFunc("/api/v1/search", searchHandler)

	log.Println("Search service (Go) listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func healthzHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "ok", "uptime_seconds": 0, "version": "0.0.1"})
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Missing query parameter 'q'", http.StatusBadRequest)
		return
	}

	searchRequest := bleve.NewSearchRequest(bleve.NewQueryStringQuery(query))
	searchResult, err := index.Search(searchRequest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(searchResult)
}
