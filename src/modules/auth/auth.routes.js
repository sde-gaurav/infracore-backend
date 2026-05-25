'use strict';

const express = require('express');

const controller = require('./auth.controller');
const validation = require('./auth.validation');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');

const router = express.Router();

// Public routes — all behind strict auth rate limiter
router.post('/register', authLimiter, validate(validation.register), controller.register);
router.post('/login', authLimiter, validate(validation.login), controller.login);
router.post('/refresh', authLimiter, validate(validation.refreshToken), controller.refresh);
router.post('/forgot-password', authLimiter, validate(validation.forgotPassword), controller.forgotPassword);
router.post('/reset-password', authLimiter, validate(validation.resetPassword), controller.resetPassword);
router.get('/verify-email', validate(validation.verifyEmail), controller.verifyEmail);
router.post('/resend-verification', authLimiter, validate(validation.forgotPassword), controller.resendVerification);
router.post('/send-otp', authLimiter, validate(validation.forgotPassword), controller.sendOTP);
router.post('/verify-otp', authLimiter, validate(validation.verifyOTP), controller.verifyOTP);

// Protected routes
router.use(authenticate);
router.post('/logout', controller.logout);
router.post('/change-password', validate(validation.changePassword), controller.changePassword);
router.get('/me', controller.me);

module.exports = router;
