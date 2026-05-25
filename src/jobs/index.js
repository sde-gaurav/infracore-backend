'use strict';

const cron = require('node-cron');

const { cleanupExpiredTokens } = require('./cleanup.job');
const logger = require('../config/logger');
const config = require('../config');

const jobs = [];

const registerJob = (schedule, name, fn) => {
  const task = cron.schedule(schedule, async () => {
    logger.info(`Cron job started: ${name}`);
    try {
      await fn();
      logger.info(`Cron job completed: ${name}`);
    } catch (err) {
      logger.error(`Cron job error [${name}]: ${err.message}`);
    }
  }, { scheduled: false, timezone: 'UTC' });

  jobs.push({ name, task });
  return task;
};

const startAllJobs = () => {
  if (config.isTest) return;

  // Every day at 2 AM UTC — purge expired / revoked tokens
  registerJob('0 2 * * *', 'cleanupExpiredTokens', cleanupExpiredTokens);

  jobs.forEach(({ task, name }) => {
    task.start();
    logger.info(`Cron job scheduled: ${name}`);
  });

  logger.info(`${jobs.length} cron job(s) registered`);
};

const stopAllJobs = () => {
  jobs.forEach(({ task, name }) => {
    task.stop();
    logger.info(`Cron job stopped: ${name}`);
  });
};

module.exports = { startAllJobs, stopAllJobs };
