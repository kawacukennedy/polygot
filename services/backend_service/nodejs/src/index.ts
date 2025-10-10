import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';
import logger from './utils/logger';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import snippetRoutes from './routes/snippet';
import commentRoutes from './routes/comment';
import searchRoutes from './routes/search';
import gdprRoutes from './routes/gdpr';
import leaderboardRoutes from './routes/leaderboard';
import notificationRoutes from './routes/notification';
import adminRoutes from './routes/admin';

dotenv.config();

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // Add profiling integration
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

const app = express();

// The request handler must be the first middleware on the app
app.use(Sentry.expressIntegration());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.tracingHandler());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/snippets', snippetRoutes);
app.use('/comments', commentRoutes);
app.use('/search', searchRoutes);
app.use('/gdpr', gdprRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);

// Serve static files (avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'User connected');

  // Join leaderboard room for real-time updates
  socket.on('join-leaderboard', () => {
    socket.join('leaderboard');
    logger.info({ socketId: socket.id }, 'User joined leaderboard room');
  });

  // Leave leaderboard room
  socket.on('leave-leaderboard', () => {
    socket.leave('leaderboard');
    logger.info({ socketId: socket.id }, 'User left leaderboard room');
  });

  socket.on('disconnect', () => {
    logger.info({ socketId: socket.id }, 'User disconnected');
  });
});

// Export io for use in other modules
export { io };

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.expressErrorHandler());

// Optional fallthrough error handler
app.use(function onError(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + '\n');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server running');
});