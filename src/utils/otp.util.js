'use strict';

const crypto = require('crypto');

const config = require('../config');

const generateOTP = (length = config.otp.length) => {
  const digits = '0123456789';
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes)
    .map((byte) => digits[byte % digits.length])
    .join('');
};

const getOTPExpiry = () => new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

const isOTPExpired = (expiresAt) => !expiresAt || new Date() > new Date(expiresAt);

module.exports = { generateOTP, getOTPExpiry, isOTPExpired };
