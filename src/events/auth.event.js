const logger = require('../config/logger');

const emitter = require('./index');

const AUTH_EVENTS = Object.freeze({
  LOGIN_FAILED: 'auth:login_failed',
  TOKEN_REFRESHED: 'auth:token_refreshed',
  PASSWORD_RESET_REQUESTED: 'auth:password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'auth:password_reset_completed',
});

const emitLoginFailed = (email, ipAddress) => {
  emitter.emit(AUTH_EVENTS.LOGIN_FAILED, { email, ipAddress });
};

// Default listener — log suspicious login failures for monitoring
emitter.on(AUTH_EVENTS.LOGIN_FAILED, ({ email, ipAddress }) => {
  logger.warn(`Failed login attempt for ${email} from ${ipAddress}`);
});

module.exports = { AUTH_EVENTS, emitLoginFailed };
