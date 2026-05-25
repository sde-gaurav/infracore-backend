'use strict';

const http = require('http');

const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const { connect: connectMongo, disconnect: disconnectMongo } = require('./database/mongoose');
const { getClient: getRedisClient, disconnect: disconnectRedis } = require('./database/redis');
const { initSocket } = require('./sockets');
const { startAllWorkers, stopAllWorkers } = require('./queues');
const { startAllJobs, stopAllJobs } = require('./jobs');
const { verifyTransporter } = require('./config/email');

const server = http.createServer(app);

// =========================================================
// GRACEFUL SHUTDOWN
// =========================================================
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received — starting graceful shutdown`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await Promise.allSettled([
        disconnectMongo(),
        disconnectRedis(),
        stopAllWorkers(),
        stopAllJobs(),
      ]);
      logger.info('Graceful shutdown complete');
    } catch (err) {
      logger.error(`Error during shutdown: ${err.message}`);
    }

    process.exit(0);
  });

  // Force exit after 15 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 15000).unref();
};

// =========================================================
// BOOT SEQUENCE
// =========================================================
const bootstrap = async () => {
  try {
    logger.info(`Starting ${config.app.name} [${config.env}]`);

    // 1. Databases
    await connectMongo();
    getRedisClient(); // Eagerly connect

    // 2. Email transporter
    await verifyTransporter();

    // 3. Socket.IO
    initSocket(server);

    // 4. Queue workers
    startAllWorkers();

    // 5. Cron jobs
    startAllJobs();

    // 6. Start HTTP server
    server.listen(config.app.port, () => {
      logger.info(`Server running on port ${config.app.port}`);
      logger.info(`API docs → http://localhost:${config.app.port}/api-docs`);
      logger.info(`Health   → http://localhost:${config.app.port}/api/v1/health`);
    });

    // Handle server-level errors (e.g., EADDRINUSE)
    server.on('error', (err) => {
      logger.error(`Server error: ${err.message}`);
      process.exit(1);
    });

  } catch (err) {
    logger.error(`Bootstrap failed: ${err.message}`);
    process.exit(1);
  }
};

// =========================================================
// PROCESS SIGNAL HANDLERS
// =========================================================
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  gracefulShutdown('unhandledRejection');
});

bootstrap();

module.exports = server;
