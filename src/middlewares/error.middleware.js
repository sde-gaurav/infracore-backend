const mongoose = require('mongoose');

const config = require('../config');
const logger = require('../config/logger');
const { HTTP_STATUS } = require('../constants/http.constant');
const ApiError = require('../core/ApiError');

/**
 * Translates well-known library errors into ApiError instances
 * before the global error formatter runs.
 */
const normalizeError = (err) => {
  // Already normalised
  if (err instanceof ApiError) return err;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return ApiError.badRequest('Validation failed', errors);
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid value for field: ${err.path}`);
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`Duplicate value for ${field}`);
  }

  // JWT errors forwarded without normalisation
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return ApiError.unauthorized(err.message);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return ApiError.badRequest(`File upload error: ${err.message}`);
  }

  // Mongoose disconnect / timeout
  if (err instanceof mongoose.Error) {
    return ApiError.serviceUnavailable('Database operation failed');
  }

  // Unknown — treat as non-operational 500
  return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Internal server error', [], false);
};

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  const apiError = normalizeError(err);

  // Log non-operational errors (programmer/infrastructure errors) at error level
  if (!apiError.isOperational) {
    logger.error({
      message: apiError.message,
      stack: apiError.stack,
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?._id,
    });
  } else if (apiError.statusCode >= 500) {
    logger.error({ message: apiError.message, requestId: req.id });
  } else {
    logger.warn({ message: apiError.message, statusCode: apiError.statusCode, requestId: req.id });
  }

  const response = {
    success: false,
    message: apiError.message,
    error: apiError.name,
    errors: apiError.errors,
  };

  // Never leak stack traces in production
  if (config.isDevelopment) response.stack = apiError.stack;

  return res.status(apiError.statusCode).json(response);
};

module.exports = { globalErrorHandler, normalizeError };
