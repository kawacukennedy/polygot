# Worker Service (Python)

This is the Python implementation of the Worker Service using Celery.

## Quickstart

```bash
pip install -r requirements.txt
celery -A worker worker --loglevel=info
```

## Health Check

This is a worker service, health check might be different (e.g., monitoring Celery queues).
