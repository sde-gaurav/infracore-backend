'use strict';

const Token = require('../models/Token.model');
const logger = require('../config/logger');

const cleanupExpiredTokens = async () => {
  try {
    const result = await Token.deleteMany({
      $or: [
        { expiresAt: { $lte: new Date() } },
        { isRevoked: true, updatedAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      ],
    });
    logger.info(`Token cleanup: removed ${result.deletedCount} expired/revoked tokens`);
  } catch (err) {
    logger.error(`Token cleanup job failed: ${err.message}`);
  }
};

module.exports = { cleanupExpiredTokens };
