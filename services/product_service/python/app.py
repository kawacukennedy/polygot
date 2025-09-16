
from flask import Flask, jsonify, request
import os
import psycopg2
from psycopg2.extras import RealDictCursor

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

@app.route('/api/v1/products')
def get_products():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    offset = (page - 1) * limit
    
    search_query = request.args.get('q')
    
    if search_query:
        cur.execute("SELECT * FROM products WHERE to_tsvector('english', title) @@ to_tsquery('english', %s) LIMIT %s OFFSET %s", (search_query, limit, offset))
    else:
        cur.execute("SELECT * FROM products LIMIT %s OFFSET %s", (limit, offset))
        
    products = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({"items": products, "meta": {"page": page, "limit": limit}})

@app.route('/api/v1/products/<product_id>')
def get_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM products WHERE id = %s", (product_id,))
    product = cur.fetchone()
    cur.close()
    conn.close()
    if product is None:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
