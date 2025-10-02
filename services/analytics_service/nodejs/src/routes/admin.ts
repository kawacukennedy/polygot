import { Router, Request, Response } from 'express';
import { getSystemHealthAdmin } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

router.get('/system-health', authMiddleware, adminMiddleware, getSystemHealthAdmin);

export default router;
