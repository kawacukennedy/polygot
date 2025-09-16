const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Import cors

const app = express();
const port = 8080;

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'polyglot',
  user: process.env.DB_USER || 'pp',
  password: process.env.DB_PASSWORD || 'pp',
});

app.use(bodyParser.json());
app.use(cors()); // Use cors middleware

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', uptime_seconds: process.uptime(), version: '1.0.0' });
});

app.post('/api/v1/auth/register', async (req, res) => {
  const { email, password, confirm_password } = req.body;

  const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,72}$/;

  if (!email || !password || !confirm_password) {
    return res.status(422).json({ status: 'error', error_code: 'VALIDATION_FAILED', message: 'Email, password, and confirm password are required' });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(422).json({ status: 'error', error_code: 'VALIDATION_FAILED', field: 'email', message: 'Invalid email format' });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(422).json({ status: 'error', error_code: 'VALIDATION_FAILED', field: 'password', message: 'Password does not meet strength requirements (8-72 chars, uppercase, lowercase, digit, special)' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ status: 'error', error_code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12); // Using cost factor 12 as per backend spec
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    res.status(201).json({ status: 'ok', message: 'User registered successfully' });
  } catch (error) {
    if (error.code === '23505') { // unique_violation
      return res.status(409).json({ status: 'error', error_code: 'EMAIL_ALREADY_EXISTS', message: 'User with this email already exists' });
    }
    console.error(error);
    res.status(500).json({ status: 'error', error_code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
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