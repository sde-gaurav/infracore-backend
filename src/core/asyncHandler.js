'use strict';

/**
 * Wraps an async Express route handler and forwards any rejection to next().
 * Eliminates try/catch boilerplate in every controller method.
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
