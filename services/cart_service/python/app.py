from flask import Flask, jsonify, request
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import json

app = Flask(__name__)

def get_db_connection():
    conn = psycopg2.connect(
        host=os.environ.get("DB_HOST", "postgres"),
        database=os.environ.get("DB_NAME", "polyglot"),
        user=os.environ.get("DB_USER", "pp"),
        password=os.environ.get("DB_PASSWORD", "pp")
    )
    return conn

@app.route('/healthz')
def healthz():
    return jsonify({"status": "ok", "uptime_seconds": 0, "version": "0.0.1"})

@app.route('/api/v1/cart', methods=['GET'])
def get_cart():
    session_id = request.headers.get('X-Session-ID')
    if not session_id:
        return jsonify({'error': 'X-Session-ID header is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM carts WHERE session_id = %s", (session_id,))
    cart = cur.fetchone()
    cur.close()
    conn.close()

    if cart is None:
        return jsonify({'id': '', 'session_id': session_id, 'items': []})
    return jsonify(cart)

@app.route('/api/v1/cart', methods=['POST'])
def add_to_cart():
    session_id = request.headers.get('X-Session-ID')
    if not session_id:
        return jsonify({'error': 'X-Session-ID header is required'}), 400

    data = request.get_json()
    if not data or 'product_id' not in data or 'quantity' not in data:
        return jsonify({'error': 'product_id and quantity are required'}), 400

    product_id = data['product_id']
    quantity = data['quantity']

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Check if cart exists
    cur.execute("SELECT * FROM carts WHERE session_id = %s", (session_id,))
    cart = cur.fetchone()

    if cart is None:
        # Create new cart
        cur.execute("INSERT INTO carts (session_id, items) VALUES (%s, %s) RETURNING *", 
                    (session_id, json.dumps([{'product_id': product_id, 'quantity': quantity}])))
        new_cart = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return jsonify(new_cart), 201
    else:
        # Update existing cart
        items = cart['items']
        found = False
        for item in items:
            if item['product_id'] == product_id:
                item['quantity'] += quantity
                found = True
                break
        if not found:
            items.append({'product_id': product_id, 'quantity': quantity})
        
        cur.execute("UPDATE carts SET items = %s WHERE session_id = %s RETURNING *", 
                    (json.dumps(items), session_id))
        updated_cart = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return jsonify(updated_cart)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)