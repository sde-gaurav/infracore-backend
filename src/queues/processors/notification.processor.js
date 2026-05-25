const logger = require('../../config/logger');

const NOTIFICATION_JOB_TYPES = Object.freeze({
  PUSH: 'push',
  IN_APP: 'in_app',
  SMS: 'sms',
});

const processNotificationJob = async (job) => {
  const { type, payload } = job.data;
  logger.info(`Processing notification job [${type}]`, { jobId: job.id });

  switch (type) {
    case NOTIFICATION_JOB_TYPES.PUSH:
      // TODO: integrate push notification provider (FCM, APNs, etc.)
      logger.info(`Push notification queued for user ${payload?.userId}`);
      break;
    case NOTIFICATION_JOB_TYPES.IN_APP:
      // TODO: persist to database and emit via Socket.IO
      logger.info(`In-app notification for user ${payload?.userId}`);
      break;
    case NOTIFICATION_JOB_TYPES.SMS:
      // TODO: integrate SMS provider (Twilio, AWS SNS, etc.)
      logger.info(`SMS notification queued for ${payload?.phone}`);
      break;
    default:
      logger.warn(`Unknown notification job type: ${type}`);
  }
};

module.exports = { processNotificationJob, NOTIFICATION_JOB_TYPES };
