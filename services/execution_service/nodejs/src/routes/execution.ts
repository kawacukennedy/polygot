
import { Router } from 'express';
import { Server } from 'socket.io';
import { executeCode } from '../controllers/executionController';

export default (io: Server) => {
  const router = Router();

  router.post('/', (req, res) => executeCode(req, res, io));

  return router;
};
