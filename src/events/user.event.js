'use strict';

const emitter = require('./index');
const logger = require('../config/logger');

const USER_EVENTS = Object.freeze({
  REGISTERED: 'user:registered',
  LOGGED_IN: 'user:logged_in',
  LOGGED_OUT: 'user:logged_out',
  UPDATED: 'user:updated',
  DELETED: 'user:deleted',
  DEACTIVATED: 'user:deactivated',
  PASSWORD_CHANGED: 'user:password_changed',
  EMAIL_VERIFIED: 'user:email_verified',
});

const emitUserRegistered = (user) => {
  logger.info(`Event: ${USER_EVENTS.REGISTERED} for user ${user._id}`);
  emitter.emit(USER_EVENTS.REGISTERED, user);
};

const emitUserLoggedIn = (user) => {
  logger.info(`Event: ${USER_EVENTS.LOGGED_IN} for user ${user._id}`);
  emitter.emit(USER_EVENTS.LOGGED_IN, user);
};

const emitUserUpdated = (user) => {
  emitter.emit(USER_EVENTS.UPDATED, user);
};

const emitUserDeleted = (userId) => {
  emitter.emit(USER_EVENTS.DELETED, { userId });
};

// Register default listeners
emitter.on(USER_EVENTS.REGISTERED, (user) => {
  logger.info(`New user registered: ${user.email}`);
});

emitter.on(USER_EVENTS.LOGGED_IN, (user) => {
  logger.info(`User logged in: ${user.email}`);
});

module.exports = { USER_EVENTS, emitUserRegistered, emitUserLoggedIn, emitUserUpdated, emitUserDeleted };
