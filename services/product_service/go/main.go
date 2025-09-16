
package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	_ "github.com/lib/pq"
	"github.com/gorilla/mux"
)

type Product struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	PriceCents  int       `json:"price_cents"`
	Currency    string    `json:"currency"`
	Stock       int       `json:"stock"`
	ImageURL    string    `json:"image_url"`
	CreatedAt   time.Time `json:"created_at"`
}

var db *sql.DB

func main() {
	var err error
	connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	router := mux.NewRouter()
	router.HandleFunc("/healthz", healthzHandler).Methods("GET")
	router.HandleFunc("/api/v1/products", getProductsHandler).Methods("GET")
	router.HandleFunc("/api/v1/products/{id}", getProductHandler).Methods("GET")

	log.Println("Product service (Go) listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func healthzHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "ok", "uptime_seconds": 0, "version": "0.0.1"})
}

func getProductsHandler(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 {
		limit = 20
	}
	offset := (page - 1) * limit
	searchQuery := r.URL.Query().Get("q")

	var rows *sql.Rows
	var err error

	if searchQuery != "" {
		rows, err = db.Query("SELECT id, title, description, price_cents, currency, stock, image_url, created_at FROM products WHERE to_tsvector('english', title) @@ to_tsquery('english', $1) LIMIT $2 OFFSET $3", searchQuery, limit, offset)
	} else {
		rows, err = db.Query("SELECT id, title, description, price_cents, currency, stock, image_url, created_at FROM products LIMIT $1 OFFSET $2", limit, offset)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	products := []Product{}
	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.PriceCents, &p.Currency, &p.Stock, &p.ImageURL, &p.CreatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		products = append(products, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"items": products, "meta": map[string]int{"page": page, "limit": limit}})
}

func getProductHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var p Product
	err := db.QueryRow("SELECT id, title, description, price_cents, currency, stock, image_url, created_at FROM products WHERE id = $1", id).Scan(&p.ID, &p.Title, &p.Description, &p.PriceCents, &p.Currency, &p.Stock, &p.ImageURL, &p.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}
