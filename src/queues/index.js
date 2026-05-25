'use strict';

const emailQueue = require('./email.queue');
const notificationQueue = require('./notification.queue');
const logger = require('../config/logger');

const startAllWorkers = () => {
  emailQueue.startWorker();
  notificationQueue.startWorker();
  logger.info('All queue workers started');
};

const stopAllWorkers = async () => {
  await Promise.allSettled([
    emailQueue.stopWorker(),
    notificationQueue.stopWorker(),
  ]);
  logger.info('All queue workers stopped');
};

module.exports = { startAllWorkers, stopAllWorkers, emailQueue, notificationQueue };
