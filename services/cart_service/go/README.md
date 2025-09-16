# Cart Service (Go)

This is the Go implementation of the Cart Service.

## Running the service

### Prerequisites
- Docker
- Go 1.19

### With Docker
```bash
docker build -t polyglot/cart-service-go .
docker run -p 8080:8080 polyglot/cart-service-go
```

### Locally
```bash
go run main.go
```
