import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import logger from './logger';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File filter for images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with user ID
    const userId = req.user?.userId || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `avatar-${userId}-${uniqueSuffix}${extension}`);
  }
});

// Upload middleware
export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter
});

// Helper function to delete old avatar
export const deleteOldAvatar = (avatarUrl: string | null) => {
  if (!avatarUrl) return;

  // Extract filename from URL (assuming local storage for now)
  const filename = path.basename(avatarUrl);
  const filePath = path.join(uploadsDir, filename);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      logger.info({ filename }, 'Old avatar deleted');
    } catch (error) {
      logger.error({ error, filename }, 'Failed to delete old avatar');
    }
  }
};

// Generate avatar URL
export const getAvatarUrl = (filename: string): string => {
  // In production, this would be a CDN URL
  return `/uploads/avatars/${filename}`;
};