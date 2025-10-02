# Worker Service (Rust)

This is the Rust implementation of the Worker Service, using Tokio and Redis.

## Running the service

### Prerequisites
- Docker
- Rust 1.71

### With Docker
```bash
docker build -t polyglot/worker-service-rust .
docker run -e REDIS_URL=redis://your-redis-host:6379 polyglot/worker-service-rust
```

### Locally
```bash
cargo run
```
