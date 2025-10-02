
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import config from './config';
import executionRoutes from './routes/execution';

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/execute', executionRoutes);

app.listen(config.port, () => {
  console.log(`Execution service (Node.js) listening at http://localhost:${config.port}`);
});
