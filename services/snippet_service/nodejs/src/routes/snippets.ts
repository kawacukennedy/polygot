
import { Router } from 'express';
import { createSnippet, runSnippet, fetchSnippets, fetchUserSnippets, updateSnippet, deleteSnippet, flagSnippet } from '../controllers/snippetController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createSnippet);
router.get('/', authMiddleware, fetchSnippets);
router.get('/user/:userId', authMiddleware, fetchUserSnippets);
router.put('/:id', authMiddleware, updateSnippet);
router.delete('/:id', authMiddleware, deleteSnippet);
router.post('/:id/flag', authMiddleware, flagSnippet);
router.post('/:id/run', authMiddleware, runSnippet);

export default router;
