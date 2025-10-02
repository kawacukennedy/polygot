import { Router, Request, Response } from 'express';
import { getAllSnippetsAdmin, deleteSnippetAdmin, flagSnippetAdmin } from '../controllers/adminController';
import authMiddleware from '../middleware/authMiddleware';
import adminMiddleware from '../middleware/adminMiddleware';

const router = Router();

router.get('/snippets', authMiddleware, adminMiddleware, getAllSnippetsAdmin);
router.delete('/snippets/:id', authMiddleware, adminMiddleware, deleteSnippetAdmin);
router.put('/snippets/:id/flag', authMiddleware, adminMiddleware, flagSnippetAdmin);

export default router;
