
import { Router } from 'express';
import multer from 'multer';
import { updateUser, getUser } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/:id', authMiddleware, getUser);
router.put('/:id', authMiddleware, upload.single('avatar'), updateUser);

export default router;
