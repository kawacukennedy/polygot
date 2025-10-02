# Product Service (Go)

This is the Go implementation of the Product Service.

## Running the service

### Prerequisites
- Docker
- Go 1.19

### With Docker
```bash
docker build -t polyglot/product-service-go .
docker run -p 8080:8080 polyglot/product-service-go
```

### Locally
```bash
go run main.go
```
