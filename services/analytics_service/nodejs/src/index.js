
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'polyglot',
  user: process.env.DB_USER || 'pp',
  password: process.env.DB_PASSWORD || 'pp',
});

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', uptime_seconds: 0, version: '0.0.1' });
});

app.get('/metrics', (req, res) => {
    res.send('Prometheus metrics would be exposed here.');
});

app.get('/api/v1/benchmarks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM benchmark_results ORDER BY run_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/v1/benchmarks/run', async (req, res) => {
  const { target_service, implementation_id, duration_seconds } = req.body;

  if (!target_service || !implementation_id || !duration_seconds) {
    return res.status(400).json({ error: 'Missing target_service, implementation_id, or duration_seconds' });
  }

  // In a real application, this would trigger a k6 run.
  // For this demo, we'll just insert a placeholder result.
  try {
    const result = await pool.query(
      'INSERT INTO benchmark_results (implementation_id, service_name, duration_seconds, p50_ms, p95_ms, p99_ms, rps, memory_peak_mb, errors) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [implementation_id, target_service, duration_seconds, 50, 100, 200, 1000, 256, 0]
    );
    res.status(202).json({ run_id: result.rows[0].id, status: 'Benchmark started' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Analytics service (Node.js) listening on port ${port}`);
});
