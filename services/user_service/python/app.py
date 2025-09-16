from flask import Flask, jsonify
import os
import time

app = Flask(__name__)

start_time = time.time()

@app.route('/healthz')
def healthz():
    uptime = time.time() - start_time
    return jsonify({"status": "ok", "uptime_seconds": uptime, "version": "1.0.0"})

@app.route('/')
def hello():
    return "User Service Python\n"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

