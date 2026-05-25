'use strict';

const Joi = require('joi');

const { REGEX } = require('../../constants/regex.constant');

const passwordSchema = Joi.string()
  .min(8)
  .max(72)
  .pattern(REGEX.PASSWORD)
  .messages({
    'string.pattern.base': 'Password must contain uppercase, lowercase, digit and special character',
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password cannot exceed 72 characters',
  });

const register = {
  body: Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required(),
    lastName: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
    password: passwordSchema.required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
    }),
    phone: Joi.string().pattern(REGEX.PHONE).optional(),
  }),
};

const login = {
  body: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
    password: Joi.string().required(),
  }),
};

const refreshToken = {
  body: Joi.object({
    refreshToken: Joi.string().optional(),
  }),
};

const forgotPassword = {
  body: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
  }),
};

const resetPassword = {
  body: Joi.object({
    token: Joi.string().required(),
    password: passwordSchema.required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
    }),
  }),
};

const changePassword = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: passwordSchema.required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Passwords do not match',
    }),
  }),
};

const verifyEmail = {
  query: Joi.object({
    token: Joi.string().required(),
  }),
};

const verifyOTP = {
  body: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),
};

module.exports = { register, login, refreshToken, forgotPassword, resetPassword, changePassword, verifyEmail, verifyOTP };
