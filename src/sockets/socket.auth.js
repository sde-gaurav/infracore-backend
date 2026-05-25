'use strict';

const { verifyAccessToken } = require('../utils/jwt.util');
const { isAccessTokenBlocked } = require('../cache/token.cache');
const User = require('../models/User.model');
const logger = require('../config/logger');

/**
 * Socket.IO authentication middleware.
 * Validates the Bearer token in the socket handshake and attaches user to socket.
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = await verifyAccessToken(token);

    if (decoded.jti && (await isAccessTokenBlocked(decoded.jti))) {
      return next(new Error('Token has been revoked'));
    }

    const user = await User.findOne({ _id: decoded.sub, isActive: true }).lean();
    if (!user) return next(new Error('User not found'));

    socket.user = user;
    socket.userId = user._id.toString();
    socket.userRole = user.role;

    logger.info(`Socket authenticated: user ${user._id} connected`);
    return next();
  } catch (err) {
    logger.warn(`Socket auth failed: ${err.message}`);
    return next(new Error('Authentication failed'));
  }
};

module.exports = socketAuthMiddleware;
