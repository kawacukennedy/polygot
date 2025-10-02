import { Router, Request, Response } from 'express';
import { getAllExecutionsAdmin, rerunExecutionAdmin, killExecutionAdmin } from '../controllers/adminController';
import authMiddleware from '../middleware/authMiddleware';
import adminMiddleware from '../middleware/adminMiddleware';
import { Server } from 'socket.io';
import { Pool } from 'pg';

const createAdminRouter = (io: Server, pool: Pool) => {
  const router = Router();

  router.get('/executions', authMiddleware, adminMiddleware, (req: Request, res: Response) => getAllExecutionsAdmin(req, res, pool));
  router.post('/executions/:id/rerun', authMiddleware, adminMiddleware, (req: Request, res: Response) => rerunExecutionAdmin(req, res, io, pool));
  router.post('/executions/:id/kill', authMiddleware, adminMiddleware, (req: Request, res: Response) => killExecutionAdmin(req, res, io, pool));

  return router;
};

export default createAdminRouter;
