const http = require('http');
const { Server } = require("socket.io");

const hostname = '0.0.0.0';
const port = 8080;

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', uptime_seconds: process.uptime(), version: '1.0.0' }));
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Chat Service Node.js\n');
  }
});

const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

