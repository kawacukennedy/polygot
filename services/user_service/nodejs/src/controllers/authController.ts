
import { Request, Response } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';

const pool = new Pool({
  host: config.db.host,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

export const register = async (req: Request, res: Response) => {
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
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    res.status(201).json({ status: 'ok', message: 'User registered successfully' });
  } catch (error: any) {
    if (error.code === '23505') { // unique_violation
      return res.status(409).json({ status: 'error', error_code: 'EMAIL_ALREADY_EXISTS', message: 'User with this email already exists' });
    }
    console.error(error);
    res.status(500).json({ status: 'error', error_code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ status: 'error', error_code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    }

    // Placeholder for account locked logic
    // if (user.login_attempts >= 5 && user.last_login_attempt > (Date.now() - 30 * 60 * 1000)) { // e.g., locked for 30 mins
    //   return res.status(403).json({ status: 'error', error_code: 'ACCOUNT_LOCKED', message: 'Account locked after multiple failed attempts' });
    // }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // In a real app, you would increment login attempts here
      return res.status(401).json({ status: 'error', error_code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    // await pool.query('UPDATE users SET login_attempts = 0 WHERE id = $1', [user.id]);

    const accessToken = jwt.sign({ userId: user.id }, config.jwt.access_token_secret, { expiresIn: config.jwt.access_token_expiry });
    const refreshToken = jwt.sign({ userId: user.id }, config.jwt.refresh_token_secret, { expiresIn: config.jwt.refresh_token_expiry });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.json({ accessToken, user: { id: user.id, email: user.email, name: user.name, bio: user.bio, avatar_url: user.avatar_url } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ status: 'error', message: 'Refresh token not found' });
  }

  try {
    const decoded: any = jwt.verify(refreshToken, config.jwt.refresh_token_secret);
    const accessToken = jwt.sign({ userId: decoded.userId }, config.jwt.access_token_secret, { expiresIn: config.jwt.access_token_expiry });
    const newRefreshToken = jwt.sign({ userId: decoded.userId }, config.jwt.refresh_token_secret, { expiresIn: config.jwt.refresh_token_expiry });

    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(403).json({ status: 'error', message: 'Invalid refresh token' });
  }
};
