
import { Router } from 'express';
import { createSnippet, runSnippet } from '../controllers/snippetController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createSnippet);
router.post('/:id/run', authMiddleware, runSnippet);

export default router;
