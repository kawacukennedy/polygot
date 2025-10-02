# Search Service (Go)

This is the Go implementation of the Search Service, using Bleve for in-memory indexing.

## Running the service

### Prerequisites
- Docker
- Go 1.19

### With Docker
```bash
docker build -t polyglot/search-service-go .
docker run -p 8080:8080 polyglot/search-service-go
```

### Locally
```bash
go run main.go
```
