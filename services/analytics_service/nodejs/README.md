# Analytics Service (Node.js)

This is the Node.js implementation of the Analytics Service.

## Running the service

### Prerequisites
- Docker
- Node.js 18

### With Docker
```bash
docker build -t polyglot/analytics-service-nodejs .
docker run -p 8080:8080 polyglot/analytics-service-nodejs
```

### Locally
```bash
npm install
npm start
```
