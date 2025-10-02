
package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
	"github.com/gorilla/mux"
)

type CartItem struct {
	ProductID  string `json:"product_id"`
	Quantity   int    `json:"quantity"`
	PriceCents int    `json:"price_cents"`
}

type Cart struct {
	ID        string     `json:"id"`
	SessionID string     `json:"session_id"`
	Items     []CartItem `json:"items"`
	UpdatedAt time.Time  `json:"updated_at"`
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
	router.HandleFunc("/api/v1/cart", getCartHandler).Methods("GET")
	router.HandleFunc("/api/v1/cart", addToCartHandler).Methods("POST")

	log.Println("Cart service (Go) listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func healthzHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "ok", "uptime_seconds": 0, "version": "0.0.1"})
}

func getCartHandler(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Header.Get("x-session-id")
	if sessionID == "" {
		http.Error(w, "Missing x-session-id header", http.StatusBadRequest)
		return
	}

	var cart Cart
	var itemsJSON []byte
	err := db.QueryRow("SELECT id, session_id, items, updated_at FROM carts WHERE session_id = $1", sessionID).Scan(&cart.ID, &cart.SessionID, &itemsJSON, &cart.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	json.Unmarshal(itemsJSON, &cart.Items)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cart)
}

func addToCartHandler(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Header.Get("x-session-id")
	if sessionID == "" {
		http.Error(w, "Missing x-session-id header", http.StatusBadRequest)
		return
	}

	var newItem CartItem
	if err := json.NewDecoder(r.Body).Decode(&newItem); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get product price
	var priceCents int
	err = tx.QueryRow("SELECT price_cents FROM products WHERE id = $1", newItem.ProductID).Scan(&priceCents)
	if err != nil {
		tx.Rollback()
		if err == sql.ErrNoRows {
			http.Error(w, "Product not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	newItem.PriceCents = priceCents

	var cart Cart
	var itemsJSON []byte
	err = tx.QueryRow("SELECT id, session_id, items, updated_at FROM carts WHERE session_id = $1 FOR UPDATE", sessionID).Scan(&cart.ID, &cart.SessionID, &itemsJSON, &cart.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			// Create new cart
			cart.SessionID = sessionID
			cart.Items = []CartItem{newItem}
			itemsJSON, _ := json.Marshal(cart.Items)
			_, err = tx.Exec("INSERT INTO carts (session_id, items) VALUES ($1, $2)", sessionID, itemsJSON)
			if err != nil {
				tx.Rollback()
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		} else {
			tx.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		// Update existing cart
		json.Unmarshal(itemsJSON, &cart.Items)
		found := false
		for i, item := range cart.Items {
			if item.ProductID == newItem.ProductID {
				cart.Items[i].Quantity += newItem.Quantity
				found = true
				break
			}
		}
		if !found {
			cart.Items = append(cart.Items, newItem)
		}
		itemsJSON, _ := json.Marshal(cart.Items)
		_, err = tx.Exec("UPDATE carts SET items = $1, updated_at = now() WHERE session_id = $2", itemsJSON, sessionID)
		if err != nil {
			tx.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Re-fetch the cart to return the updated version
	err = db.QueryRow("SELECT id, session_id, items, updated_at FROM carts WHERE session_id = $1", sessionID).Scan(&cart.ID, &cart.SessionID, &itemsJSON, &cart.UpdatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.Unmarshal(itemsJSON, &cart.Items)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(cart)
}
