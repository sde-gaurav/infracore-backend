'use strict';

const { sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail } = require('../../emails/mailer');
const logger = require('../../config/logger');

const EMAIL_JOB_TYPES = Object.freeze({
  WELCOME: 'welcome',
  OTP: 'otp',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
});

const processEmailJob = async (job) => {
  const { type, payload } = job.data;
  logger.info(`Processing email job [${type}] for ${payload?.user?.email}`);

  switch (type) {
    case EMAIL_JOB_TYPES.WELCOME:
    case EMAIL_JOB_TYPES.EMAIL_VERIFICATION:
      await sendWelcomeEmail(payload.user, payload.token);
      break;
    case EMAIL_JOB_TYPES.OTP:
      await sendOTPEmail(payload.user, payload.otp);
      break;
    case EMAIL_JOB_TYPES.PASSWORD_RESET:
      await sendPasswordResetEmail(payload.user, payload.token);
      break;
    default:
      logger.warn(`Unknown email job type: ${type}`);
  }

  logger.info(`Email job [${type}] completed for ${payload?.user?.email}`);
};

module.exports = { processEmailJob, EMAIL_JOB_TYPES };
