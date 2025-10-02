
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import config from './config';
import executionRoutes from './routes/execution';

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

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// Pass the io instance to the routes
app.use('/api/v1/execute', executionRoutes(io));

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(config.port, () => {
  console.log(`Execution service (Node.js) listening at http://localhost:${config.port}`);
});
