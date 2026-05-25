const mongoose = require('mongoose');

const TOKEN_TYPES = Object.freeze({
  REFRESH: 'refresh',
  ACCESS: 'access',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  OTP: 'otp',
});

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TOKEN_TYPES),
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    deviceId: {
      type: String,
      default: null,
    },
    replacedByToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Auto-delete expired tokens via MongoDB TTL index
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ token: 1 }, { unique: true });
tokenSchema.index({ isRevoked: 1 });

tokenSchema.statics.TOKEN_TYPES = TOKEN_TYPES;

tokenSchema.statics.revokeAllForUser = function revokeAllForUser(userId, type) {
  const filter = { userId, isRevoked: false };
  if (type) filter.type = type;
  return this.updateMany(filter, { isRevoked: true });
};

module.exports = mongoose.model('Token', tokenSchema);
