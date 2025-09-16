
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/v1/products',
    createProxyMiddleware({
      target: 'http://localhost:3102',
      changeOrigin: true,
    })
  );
  app.use(
    '/api/v1/auth',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
  app.use(
    '/api/v1/cart',
    createProxyMiddleware({
      target: 'http://localhost:3202',
      changeOrigin: true,
    })
  );
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'http://localhost:3301',
      ws: true,
      changeOrigin: true,
    })
  );
};
