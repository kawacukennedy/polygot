
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import config from './config';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin'; // Import admin routes

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes); // Mount admin routes

app.listen(config.port, () => {
  console.log(`Analytics service (Node.js) listening at http://localhost:${config.port}`);
});
