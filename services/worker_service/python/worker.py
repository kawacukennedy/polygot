from celery import Celery
import time

app = Celery('worker', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')

@app.task
def debug_task(x, y):
    time.sleep(5)
    print(f'Debug task executed: {x} + {y} = {x + y}')
    return x + y

# This is a worker, it doesn't expose HTTP endpoints directly.
# Health checks would typically involve monitoring the Redis queue or Celery's own monitoring tools.
