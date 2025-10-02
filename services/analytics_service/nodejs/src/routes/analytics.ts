
import { Router } from 'express';
import { getPopularLanguages, getTopUsers } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/popular-languages', authMiddleware, getPopularLanguages);
router.get('/top-users', authMiddleware, getTopUsers);

export default router;
