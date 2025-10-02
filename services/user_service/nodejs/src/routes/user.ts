
import { Router } from 'express';
import { updateUser, getUser } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/:id', authMiddleware, getUser);
router.put('/:id', authMiddleware, updateUser);

export default router;
