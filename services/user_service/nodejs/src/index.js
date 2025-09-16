const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8080;

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'polyglot',
  user: process.env.DB_USER || 'pp',
  password: process.env.DB_PASSWORD || 'pp',
});

app.use(bodyParser.json());

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', uptime_seconds: process.uptime(), version: '1.0.0' });
});

app.post('/api/v1/auth/register', async (req, res) => {
  const { email, password, display_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name',
      [email, hashedPassword, display_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // unique_violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ token, expires_in: 3600 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`User service (Node.js) listening at http://localhost:${port}`);
});