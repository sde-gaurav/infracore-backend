const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const config = require('../config');
const logger = require('../config/logger');

// Attach a unique request ID to every incoming request
const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Morgan token definitions
morgan.token('id', (req) => req.id);
morgan.token('user', (req) => req.user?._id?.toString() || 'anonymous');
morgan.token('body', (req) => {
  if (config.isProduction) return undefined;
  const body = { ...req.body };
  // Scrub sensitive fields
  ['password', 'confirmPassword', 'currentPassword', 'newPassword', 'token', 'secret'].forEach((k) => {
    if (body[k]) body[k] = '[REDACTED]';
  });
  return JSON.stringify(body);
});

const FORMAT = config.isProduction
  ? ':id :remote-addr :method :url :status :res[content-length] - :response-time ms'
  : ':id :method :url :status :response-time ms - :body';

const httpLogger = morgan(FORMAT, {
  stream: logger.stream,
  skip: (req) => req.url === '/health' || req.url === '/api/v1/health',
});

module.exports = { requestId, httpLogger };
