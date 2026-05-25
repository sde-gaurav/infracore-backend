'use strict';

const mongoose = require('mongoose');

const config = require('../config');
const logger = require('../config/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let retryCount = 0;

const connect = async () => {
  try {
    mongoose.set('strictQuery', true);

    // Mongoose connection events
    mongoose.connection.on('connected', () => logger.info(`MongoDB connected: ${mongoose.connection.host}`));
    mongoose.connection.on('error', (err) => logger.error(`MongoDB error: ${err.message}`));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
    mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));

    await mongoose.connect(config.mongo.uri, config.mongo.options);
    retryCount = 0;
  } catch (err) {
    retryCount += 1;
    logger.error(`MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}): ${err.message}`);

    if (retryCount >= MAX_RETRIES) {
      logger.error('Max MongoDB retries reached. Exiting.');
      process.exit(1);
    }

    logger.info(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connect();
  }
};

const disconnect = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully');
  }
};

const getStatus = () => ({
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host,
  name: mongoose.connection.name,
});

module.exports = { connect, disconnect, getStatus };
