const config = require('./index');

const defaultJobOptions = {
  attempts: config.queue.attempts,
  backoff: {
    type: 'exponential',
    delay: config.queue.backoffDelay,
  },
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 24 * 3600 },
};

const queueConfig = {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    tls: config.redis.tls ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  },
  defaultJobOptions,
};

const QUEUE_NAMES = {
  EMAIL: 'email',
  NOTIFICATION: 'notification',
  AUDIT: 'audit',
};

module.exports = { queueConfig, defaultJobOptions, QUEUE_NAMES };
