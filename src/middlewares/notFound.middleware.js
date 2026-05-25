const { GENERIC_MESSAGES } = require('../constants/messages.constant');
const ApiError = require('../core/ApiError');

const notFound = (req, res, next) => next(ApiError.notFound(`${GENERIC_MESSAGES.ROUTE_NOT_FOUND}: ${req.method} ${req.originalUrl}`));

module.exports = notFound;
