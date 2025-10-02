
import { Router } from 'express';
import { getAdminUsers, promoteUser, deactivateUser, deleteUser } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

router.get('/users', authMiddleware, adminMiddleware, getAdminUsers);
router.put('/users/:id/promote', authMiddleware, adminMiddleware, promoteUser);
router.put('/users/:id/deactivate', authMiddleware, adminMiddleware, deactivateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
