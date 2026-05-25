const jwt = require('jsonwebtoken');

const config = require('../config');
const ApiError = require('../core/ApiError');

const sign = (payload, secret, options = {}) => new Promise((resolve, reject) => {
  jwt.sign(payload, secret, options, (err, token) => {
    if (err) reject(new ApiError(500, `Token signing failed: ${err.message}`, [], false));
    else resolve(token);
  });
});

const verify = (token, secret) => new Promise((resolve, reject) => {
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') return reject(ApiError.unauthorized('Token has expired'));
      if (err.name === 'JsonWebTokenError') return reject(ApiError.unauthorized('Invalid token'));
      if (err.name === 'NotBeforeError') return reject(ApiError.unauthorized('Token not yet active'));
      return reject(ApiError.unauthorized('Token verification failed'));
    }
    resolve(decoded);
  });
});

const generateAccessToken = (payload) => sign(
  { ...payload, type: 'access' },
  config.jwt.accessSecret,
  {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  },
);

const generateRefreshToken = (payload) => sign(
  { ...payload, type: 'refresh' },
  config.jwt.refreshSecret,
  {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  },
);

const verifyAccessToken = (token) => verify(token, config.jwt.accessSecret);

const verifyRefreshToken = (token) => verify(token, config.jwt.refreshSecret);

const decodeToken = (token) => jwt.decode(token);

module.exports = {
  sign,
  verify,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
