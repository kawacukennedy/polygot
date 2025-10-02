import { Router, Request, Response } from 'express';
import { Server } from 'socket.io';
import { Pool } from 'pg';
import authMiddleware from '../middleware/authMiddleware';
import { executeCodeController, getRecentExecutionsController } from '../controllers/executionController';

const createExecutionRouter = (io: Server, pool: Pool) => {
  const router = Router();

  // Simulate code execution
  router.post('/execute', authMiddleware, (req: Request, res: Response) => executeCodeController(req, res, io, pool));

  // Get recent executions
  router.get('/recent', authMiddleware, (req: Request, res: Response) => getRecentExecutionsController(req, res, pool));

  return router;
};

export default createExecutionRouter;