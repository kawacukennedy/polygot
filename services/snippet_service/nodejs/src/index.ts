
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import config from './config';
import snippetRoutes from './routes/snippets';

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/snippets', snippetRoutes);

app.listen(config.port, () => {
  console.log(`Snippet service (Node.js) listening at http://localhost:${config.port}`);
});
