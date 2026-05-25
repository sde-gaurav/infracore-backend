'use strict';

const { Queue, Worker } = require('bullmq');

const { queueConfig, QUEUE_NAMES } = require('../config/queue');
const { processNotificationJob, NOTIFICATION_JOB_TYPES } = require('./processors/notification.processor');
const logger = require('../config/logger');
const config = require('../config');

let queue;
let worker;

const getQueue = () => {
  if (!queue) {
    queue = new Queue(QUEUE_NAMES.NOTIFICATION, {
      connection: queueConfig.connection,
      defaultJobOptions: queueConfig.defaultJobOptions,
    });
  }
  return queue;
};

const startWorker = () => {
  if (config.isTest) return null;

  worker = new Worker(QUEUE_NAMES.NOTIFICATION, processNotificationJob, {
    connection: queueConfig.connection,
    concurrency: config.queue.concurrency,
  });

  worker.on('completed', (job) => logger.info(`Notification job ${job.id} completed`));
  worker.on('failed', (job, err) => logger.error(`Notification job ${job?.id} failed: ${err.message}`));
  worker.on('error', (err) => logger.error(`Notification worker error: ${err.message}`));

  return worker;
};

const stopWorker = async () => {
  if (worker) {
    await worker.close();
    logger.info('Notification queue worker stopped');
  }
};

const addPushNotification = (userId, data) =>
  getQueue().add(NOTIFICATION_JOB_TYPES.PUSH, { type: NOTIFICATION_JOB_TYPES.PUSH, payload: { userId, ...data } });

const addInAppNotification = (userId, data) =>
  getQueue().add(NOTIFICATION_JOB_TYPES.IN_APP, { type: NOTIFICATION_JOB_TYPES.IN_APP, payload: { userId, ...data } });

module.exports = { getQueue, startWorker, stopWorker, addPushNotification, addInAppNotification };
