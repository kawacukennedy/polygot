"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvatarUrl = exports.deleteOldAvatar = exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("./logger"));
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../../uploads/avatars');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// File filter for images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'));
    }
};
// Storage configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with user ID
        const userId = req.user?.userId || 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path_1.default.extname(file.originalname);
        cb(null, `avatar-${userId}-${uniqueSuffix}${extension}`);
    }
});
// Upload middleware
exports.uploadAvatar = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter
});
// Helper function to delete old avatar
const deleteOldAvatar = (avatarUrl) => {
    if (!avatarUrl)
        return;
    // Extract filename from URL (assuming local storage for now)
    const filename = path_1.default.basename(avatarUrl);
    const filePath = path_1.default.join(uploadsDir, filename);
    if (fs_1.default.existsSync(filePath)) {
        try {
            fs_1.default.unlinkSync(filePath);
            logger_1.default.info({ filename }, 'Old avatar deleted');
        }
        catch (error) {
            logger_1.default.error({ error, filename }, 'Failed to delete old avatar');
        }
    }
};
exports.deleteOldAvatar = deleteOldAvatar;
// Generate avatar URL
const getAvatarUrl = (filename) => {
    // In production, this would be a CDN URL
    return `/uploads/avatars/${filename}`;
};
exports.getAvatarUrl = getAvatarUrl;
