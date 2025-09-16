
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

@app.route('/metrics')
def metrics():
    return 'Prometheus metrics would be exposed here.'

@app.route('/api/v1/benchmarks', methods=['GET'])
def get_benchmarks():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM benchmark_results ORDER BY run_at DESC")
    benchmarks = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(benchmarks)

@app.route('/api/v1/benchmarks/run', methods=['POST'])
def run_benchmark():
    data = request.get_json()
    target_service = data.get('target_service')
    implementation_id = data.get('implementation_id')
    duration_seconds = data.get('duration_seconds')

    if not all([target_service, implementation_id, duration_seconds]):
        return jsonify({'error': 'Missing required fields'}), 400

    # In a real application, this would trigger a k6 run.
    # For this demo, we'll just insert a placeholder result.
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        "INSERT INTO benchmark_results (implementation_id, service_name, duration_seconds, p50_ms, p95_ms, p99_ms, rps, memory_peak_mb, errors) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (implementation_id, target_service, duration_seconds, 50, 100, 200, 1000, 256, 0)
    )
    new_id = cur.fetchone()['id']
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'run_id': new_id, 'status': 'Benchmark started'}), 202

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
