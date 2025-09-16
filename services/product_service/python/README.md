# Product Service (Python)

This is the Python implementation of the Product Service.

## Running the service

### Prerequisites
- Docker
- Python 3.9

### With Docker
```bash
docker build -t polyglot/product-service-python .
docker run -p 8080:8080 polyglot/product-service-python
```

### Locally
```bash
pip install -r requirements.txt
flask run
```
