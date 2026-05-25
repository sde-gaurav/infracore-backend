const ApiError = require('../core/ApiError');

const JOI_OPTIONS = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: true,
};

const validate = (schema) => (req, res, next) => {
  const validationErrors = [];

  ['body', 'query', 'params'].forEach((source) => {
    if (!schema[source]) return;

    const { error, value } = schema[source].validate(req[source], JOI_OPTIONS);

    if (error) {
      error.details.forEach((detail) => {
        validationErrors.push({
          field: detail.path.join('.'),
          message: detail.message,
        });
      });
    } else {
      req[source] = value; // Replace with stripped / coerced values
    }
  });

  if (validationErrors.length > 0) {
    return next(ApiError.badRequest('Validation failed', validationErrors));
  }

  return next();
};

module.exports = validate;
