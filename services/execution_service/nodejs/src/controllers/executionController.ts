
import { Request, Response } from 'express';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';

// Configure Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
});

// Create a separate Redis client for subscriptions
const subscriber = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
});

export const executeCode = async (req: Request, res: Response, io: Server) => {
  const { language, code, input, timeout_ms, socketId } = req.body;

  if (!language || !code || !socketId) {
    return res.status(400).json({ status: 'error', message: 'Language, code, and socketId are required' });
  }

  const taskId = uuidv4();
  const taskPayload = {
    id: taskId,
    task: 'worker.execute_code_task',
    args: [language, code, input, timeout_ms],
    kwargs: {},
    retries: 0,
    eta: null,
    expires: null,
    utc: true,
    callbacks: null,
    errbacks: null,
    chord: null,
    headers: {},
    properties: {
      correlation_id: taskId,
      reply_to: 'celery',
    },
  };

  try {
    // Publish task to Celery queue
    await redis.lpush('celery', JSON.stringify(taskPayload));

    // Subscribe to the result channel for this task
    const resultChannel = `celery-task-meta-${taskId}`;
    subscriber.subscribe(resultChannel, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${resultChannel}:`, err);
        io.to(socketId).emit('executionError', { message: 'Failed to subscribe to execution results' });
        return;
      }
      console.log(`Subscribed to ${resultChannel}`);
    });

    subscriber.on('message', (channel, message) => {
      if (channel === resultChannel) {
        const result = JSON.parse(message);
        if (result.status === 'SUCCESS') {
          io.to(socketId).emit('executionResult', { status: 'success', ...result.result });
        } else if (result.status === 'FAILURE') {
          io.to(socketId).emit('executionResult', { status: 'error', message: 'Execution failed', ...result.result });
        } else {
          io.to(socketId).emit('executionError', { message: 'Unknown worker status', rawResult: result });
        }
        subscriber.unsubscribe(resultChannel);
        subscriber.removeAllListeners('message');
      }
    });

    res.json({ status: 'ok', message: 'Execution request sent to worker', taskId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
