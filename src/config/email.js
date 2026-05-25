'use strict';

const nodemailer = require('nodemailer');

const config = require('./index');
const logger = require('./logger');

let transporter;

const createTransporter = () => {
  if (config.isTest) {
    // Ethereal test account — swallows all emails silently
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10,
  });
};

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

const verifyTransporter = async () => {
  if (config.isTest) return;
  try {
    await getTransporter().verify();
    logger.info('SMTP transporter is ready');
  } catch (err) {
    logger.warn(`SMTP verification failed: ${err.message}. Emails may not be delivered.`);
  }
};

module.exports = { getTransporter, verifyTransporter };
