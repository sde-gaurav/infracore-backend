const { isAccessTokenBlocked } = require('../cache/token.cache');
const { AUTH_MESSAGES } = require('../constants/messages.constant');
const ApiError = require('../core/ApiError');
const asyncHandler = require('../core/asyncHandler');
const User = require('../models/User.model');
const { verifyAccessToken } = require('../utils/jwt.util');

/**
 * Extracts the Bearer token from the Authorization header or the access_token cookie.
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  if (req.cookies && req.cookies.accessToken) return req.cookies.accessToken;
  return null;
};

/**
 * Protects routes — validates the JWT access token, checks the blocklist,
 * and attaches the decoded user payload to req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized(AUTH_MESSAGES.UNAUTHORIZED);

  const decoded = await verifyAccessToken(token);

  // Reject if this specific token has been explicitly revoked (logout)
  if (decoded.jti && (await isAccessTokenBlocked(decoded.jti))) {
    throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_TOKEN);
  }

  const user = await User.findOne({ _id: decoded.sub, isActive: true }).select('+passwordChangedAt');
  if (!user) throw ApiError.unauthorized(AUTH_MESSAGES.UNAUTHORIZED);

  // Detect tokens issued before a password change
  if (user.isPasswordChangedAfter(decoded.iat)) {
    throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_TOKEN);
  }

  if (!user.isEmailVerified) {
    throw ApiError.forbidden(AUTH_MESSAGES.ACCOUNT_NOT_VERIFIED);
  }

  req.user = user;
  req.token = token;
  req.tokenPayload = decoded;

  next();
});

/**
 * Optional authentication — same as authenticate but does NOT reject unauthenticated requests.
 * Useful for routes that return different data based on auth state.
 */
const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = await verifyAccessToken(token);
    const user = await User.findOne({ _id: decoded.sub, isActive: true });
    if (user) {
      req.user = user;
      req.tokenPayload = decoded;
    }
  } catch {
    // Non-fatal — continue without auth
  }

  next();
});

module.exports = { authenticate, optionalAuthenticate };
