
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'polyglot',
  user: process.env.DB_USER || 'pp',
  password: process.env.DB_PASSWORD || 'pp',
});

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', uptime_seconds: 0, version: '0.0.1' });
});

app.get('/api/v1/cart', async (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing x-session-id header' });
  }

  try {
    const result = await pool.query('SELECT * FROM carts WHERE session_id = $1', [sessionId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/v1/cart', async (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing x-session-id header' });
  }

  const { product_id, quantity } = req.body;
  if (!product_id || !quantity) {
    return res.status(400).json({ error: 'Missing product_id or quantity' });
  }

  try {
    // Check if product exists and get its price
    const productResult = await pool.query('SELECT price_cents FROM products WHERE id = $1', [product_id]);
    if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
    }
    const priceCents = productResult.rows[0].price_cents;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if a cart already exists for the session
        let cartResult = await client.query('SELECT * FROM carts WHERE session_id = $1', [sessionId]);
        let cart;

        if (cartResult.rows.length === 0) {
            // Create a new cart if one doesn't exist
            const newCartResult = await client.query(
                'INSERT INTO carts (session_id, items) VALUES ($1, $2) RETURNING *',
                [sessionId, JSON.stringify([{ product_id, quantity, price_cents: priceCents }])]
            );
            cart = newCartResult.rows[0];
        } else {
            // Update the existing cart
            cart = cartResult.rows[0];
            const items = cart.items || [];
            const existingItemIndex = items.findIndex(item => item.product_id === product_id);

            if (existingItemIndex > -1) {
                items[existingItemIndex].quantity += quantity;
            } else {
                items.push({ product_id, quantity, price_cents: priceCents });
            }

            const updatedCartResult = await client.query(
                'UPDATE carts SET items = $1, updated_at = now() WHERE session_id = $2 RETURNING *',
                [JSON.stringify(items), sessionId]
            );
            cart = updatedCartResult.rows[0];
        }

        await client.query('COMMIT');
        res.status(200).json(cart);
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Cart service (Node.js) listening on port ${port}`);
});
