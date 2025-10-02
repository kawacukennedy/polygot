
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import config from './config';
import snippetRoutes from './routes/snippets';
import adminRoutes from './routes/admin'; // Import admin routes
import pool from './db'; // Import the database pool

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Test database connection
pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection error', err));

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/snippets', snippetRoutes);
app.use('/api/v1/admin', adminRoutes); // Mount admin routes

app.listen(config.port, () => {
  console.log(`Snippet service (Node.js) listening at http://localhost:${config.port}`);
});
