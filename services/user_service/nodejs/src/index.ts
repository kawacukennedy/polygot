
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', uptime_seconds: process.uptime(), version: '1.0.0' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

app.listen(config.port, () => {
  console.log(`User service (Node.js) listening at http://localhost:${config.port}`);
});