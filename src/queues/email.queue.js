'use strict';

const { Queue, Worker, QueueEvents } = require('bullmq');

const { queueConfig, QUEUE_NAMES } = require('../config/queue');
const { processEmailJob, EMAIL_JOB_TYPES } = require('./processors/email.processor');
const logger = require('../config/logger');
const config = require('../config');

let queue;
let worker;
let queueEvents;

const getQueue = () => {
  if (!queue) {
    queue = new Queue(QUEUE_NAMES.EMAIL, {
      connection: queueConfig.connection,
      defaultJobOptions: queueConfig.defaultJobOptions,
    });
  }
  return queue;
};

const startWorker = () => {
  if (config.isTest) return null;

  worker = new Worker(QUEUE_NAMES.EMAIL, processEmailJob, {
    connection: queueConfig.connection,
    concurrency: config.queue.concurrency,
  });

  worker.on('completed', (job) => logger.info(`Email job ${job.id} completed`));
  worker.on('failed', (job, err) => logger.error(`Email job ${job?.id} failed: ${err.message}`));
  worker.on('error', (err) => logger.error(`Email worker error: ${err.message}`));

  queueEvents = new QueueEvents(QUEUE_NAMES.EMAIL, { connection: queueConfig.connection });
  queueEvents.on('failed', ({ jobId, failedReason }) => logger.error(`Email queue event: job ${jobId} failed — ${failedReason}`));

  logger.info('Email queue worker started');
  return worker;
};

const stopWorker = async () => {
  if (worker) {
    await worker.close();
    logger.info('Email queue worker stopped');
  }
  if (queueEvents) await queueEvents.close();
};

// ---- Job factories ----

const addEmailVerificationJob = ({ user, token }) =>
  getQueue().add(
    EMAIL_JOB_TYPES.EMAIL_VERIFICATION,
    { type: EMAIL_JOB_TYPES.EMAIL_VERIFICATION, payload: { user, token } },
    { priority: 1 },
  );

const addPasswordResetJob = ({ user, token }) =>
  getQueue().add(
    EMAIL_JOB_TYPES.PASSWORD_RESET,
    { type: EMAIL_JOB_TYPES.PASSWORD_RESET, payload: { user, token } },
    { priority: 1 },
  );

const addOTPJob = ({ user, otp }) =>
  getQueue().add(
    EMAIL_JOB_TYPES.OTP,
    { type: EMAIL_JOB_TYPES.OTP, payload: { user, otp } },
    { priority: 1 },
  );

const addWelcomeJob = ({ user, token }) =>
  getQueue().add(
    EMAIL_JOB_TYPES.WELCOME,
    { type: EMAIL_JOB_TYPES.WELCOME, payload: { user, token } },
    { delay: 2000, priority: 5 },
  );

module.exports = { getQueue, startWorker, stopWorker, addEmailVerificationJob, addPasswordResetJob, addOTPJob, addWelcomeJob };
