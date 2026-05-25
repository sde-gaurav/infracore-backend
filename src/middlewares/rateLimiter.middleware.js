'use strict';

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const config = require('../config');
const { getClient } = require('../database/redis');
const { HTTP_STATUS } = require('../constants/http.constant');
const { GENERIC_MESSAGES } = require('../constants/messages.constant');

const buildRateLimiter = ({ windowMs, max, keyPrefix = 'rl' } = {}) => {
  const limiterConfig = {
    windowMs: windowMs || config.rateLimit.windowMs,
    max: max || config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: GENERIC_MESSAGES.RATE_LIMIT,
        error: 'TooManyRequestsError',
        errors: [],
      });
    },
    skip: () => config.isTest,
  };

  try {
    // Use Redis for distributed rate limiting in production
    limiterConfig.store = new RedisStore({
      sendCommand: (...args) => getClient().call(...args),
      prefix: `${keyPrefix}:`,
    });
  } catch {
    // Fallback to in-memory if Redis unavailable (development only)
  }

  return rateLimit(limiterConfig);
};

// Global rate limiter applied to all routes
const globalLimiter = buildRateLimiter({ keyPrefix: 'rl:global' });

// Strict limiter for authentication endpoints (prevents brute-force)
const authLimiter = buildRateLimiter({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  keyPrefix: 'rl:auth',
});

// Looser limiter for public endpoints that need more headroom
const publicLimiter = buildRateLimiter({ max: 200, keyPrefix: 'rl:public' });

module.exports = { globalLimiter, authLimiter, publicLimiter, buildRateLimiter };
