const { HTTP_STATUS } = require('../constants/http.constant');

/**
 * Structured operational error with HTTP semantics.
 * Distinguishes operational errors (safe to surface to clients) from
 * programmer errors (should crash the process / return 500).
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Capture clean stack without ApiError constructor frames
    Error.captureStackTrace(this, this.constructor);
  }

  // ---- 4xx factory helpers ----

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static unprocessable(message = 'Unprocessable entity', errors = []) {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, errors);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message);
  }

  // ---- 5xx factory helpers ----

  static internal(message = 'Internal server error') {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, [], false);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, message, [], false);
  }

  // ---- Serialisation helpers ----

  toJSON(includeStack = false) {
    return {
      success: false,
      message: this.message,
      error: this.name,
      errors: this.errors,
      ...(includeStack && { stack: this.stack }),
    };
  }
}

module.exports = ApiError;
