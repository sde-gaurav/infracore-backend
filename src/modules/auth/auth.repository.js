'use strict';

const BaseRepository = require('../../core/BaseRepository');
const User = require('../../models/User.model');
const Token = require('../../models/Token.model');

class AuthRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+password +emailVerificationToken +emailVerificationExpires +passwordResetToken +passwordResetExpires +otpCode +otpExpires');
  }

  findActiveUserById(id) {
    return User.findOne({ _id: id, isActive: true }).select('+passwordChangedAt');
  }

  async saveRefreshToken({ userId, token, expiresAt, userAgent, ipAddress }) {
    return Token.create({ userId, token, type: Token.schema.statics.TOKEN_TYPES?.REFRESH || 'refresh', expiresAt, userAgent, ipAddress });
  }

  findRefreshToken(token) {
    return Token.findOne({ token, type: 'refresh', isRevoked: false });
  }

  async revokeRefreshToken(tokenId) {
    return Token.findByIdAndUpdate(tokenId, { isRevoked: true });
  }

  async revokeAllUserRefreshTokens(userId) {
    return Token.updateMany({ userId, type: 'refresh', isRevoked: false }, { isRevoked: true });
  }

  async updateLoginMeta(userId, ipAddress) {
    return User.findByIdAndUpdate(userId, {
      lastLogin: new Date(),
      lastLoginIP: ipAddress,
      $inc: { loginCount: 1 },
    });
  }
}

module.exports = new AuthRepository();
