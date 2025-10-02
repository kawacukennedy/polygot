
import { Router } from 'express';
import { executeCode } from '../controllers/executionController';

const router = Router();

router.post('/', executeCode);

export default router;
