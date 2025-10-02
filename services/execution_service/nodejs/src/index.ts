
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import config from './config';
import createExecutionRouter from './routes/execution';
import createAdminRouter from './routes/admin'; // Import admin routes
import pool from './db'; // Import the database pool

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now, refine in production
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());
app.use(cors());

app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Pass the io instance and pool to the routes
app.use('/api/v1/execute', createExecutionRouter(io, pool));
app.use('/api/v1/admin', createAdminRouter(io, pool)); // Mount admin routes

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(config.port, () => {
  console.log(`Execution service (Node.js) listening at http://localhost:${config.port}`);
});
