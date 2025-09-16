# Analytics Service (Python)

This is the Python implementation of the Analytics Service.

## Running the service

### Prerequisites
- Docker
- Python 3.9

### With Docker
```bash
docker build -t polyglot/analytics-service-python .
docker run -p 8080:8080 polyglot/analytics-service-python
```

### Locally
```bash
pip install -r requirements.txt
flask run
```
