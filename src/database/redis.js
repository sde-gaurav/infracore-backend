const Redis = require('ioredis');

const config = require('../config');
const logger = require('../config/logger');

let client;

const createClient = () => {
  const redisConfig = {
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.db,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error('Redis max retry attempts reached');
        return null;
      }
      return Math.min(times * 200, 3000);
    },
    reconnectOnError: (err) => {
      logger.warn(`Redis reconnect on error: ${err.message}`);
      return true;
    },
  };

  if (config.redis.password) redisConfig.password = config.redis.password;
  if (config.redis.tls) redisConfig.tls = {};

  const instance = new Redis(redisConfig);

  instance.on('connect', () => logger.info('Redis connecting...'));
  instance.on('ready', () => logger.info(`Redis ready on ${config.redis.host}:${config.redis.port}`));
  instance.on('error', (err) => logger.error(`Redis error: ${err.message}`));
  instance.on('close', () => logger.warn('Redis connection closed'));
  instance.on('reconnecting', () => logger.info('Redis reconnecting...'));
  instance.on('end', () => logger.warn('Redis connection ended'));

  return instance;
};

const getClient = () => {
  if (!client) {
    client = createClient();
  }
  return client;
};

const disconnect = async () => {
  if (client) {
    await client.quit();
    client = null;
    logger.info('Redis disconnected gracefully');
  }
};

const isReady = () => client && client.status === 'ready';

module.exports = { getClient, disconnect, isReady, createClient };
