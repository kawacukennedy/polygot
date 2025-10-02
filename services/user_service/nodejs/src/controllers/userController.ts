
import { Request, Response } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import config from '../config';
import { uploadAvatar } from '../services/supabaseService';

const pool = new Pool({
  host: config.db.host,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT id, email, name, bio, avatar_url FROM users WHERE id = $1', [id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, bio, current_password, new_password } = req.body;

  try {
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(name);
    }
    if (bio !== undefined) {
      updateFields.push(`bio = $${paramIndex++}`);
      updateValues.push(bio);
    }

    if (req.file) {
      // Handle avatar upload
      const avatarUrl = await uploadAvatar(id, req.file);
      updateFields.push(`avatar_url = $${paramIndex++}`);
      updateValues.push(avatarUrl);
    }

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ status: 'error', message: 'Current password is required to change password.' });
      }

      const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
      const user = userResult.rows[0];

      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      const passwordMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ status: 'error', message: 'Invalid current password.' });
      }

      const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,72}$/;
      if (!PASSWORD_REGEX.test(new_password)) {
        return res.status(422).json({ status: 'error', error_code: 'VALIDATION_FAILED', field: 'new_password', message: 'New password does not meet strength requirements (8-72 chars, uppercase, lowercase, digit, special)' });
      }

      const hashedNewPassword = await bcrypt.hash(new_password, 12);
      updateFields.push(`password_hash = $${paramIndex++}`);
      updateValues.push(hashedNewPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, bio, avatar_url`;
    updateValues.push(id);

    const result = await pool.query(query, updateValues);
    const updatedUser = result.rows[0];

    if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
