'use strict';

const authService = require('./auth.service');
const ApiResponse = require('../../core/ApiResponse');
const asyncHandler = require('../../core/asyncHandler');
const { AUTH_MESSAGES } = require('../../constants/messages.constant');
const config = require('../../config');

const COOKIE_OPTIONS = {
  httpOnly: config.cookie.httpOnly,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setRefreshCookie = (res, token) => res.cookie('refreshToken', token, COOKIE_OPTIONS);
const clearRefreshCookie = (res) => res.clearCookie('refreshToken', COOKIE_OPTIONS);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, confirmPassword]
 *             properties:
 *               firstName: { type: string, example: John }
 *               lastName:  { type: string, example: Doe  }
 *               email:     { type: string, format: email }
 *               password:  { type: string, format: password }
 *               confirmPassword: { type: string }
 *     responses:
 *       201: { description: Registration successful }
 *       409: { $ref: '#/components/responses/ConflictError' }
 *       422: { $ref: '#/components/responses/ValidationError' }
 */
const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, AUTH_MESSAGES.REGISTER_SUCCESS, { userId: user._id });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate user and issue token pair
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200: { description: Login successful }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
const login = asyncHandler(async (req, res) => {
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
  const { user, accessToken, refreshToken } = await authService.login(req.body, meta);

  setRefreshCookie(res, refreshToken);

  ApiResponse.ok(res, AUTH_MESSAGES.LOGIN_SUCCESS, {
    user,
    accessToken,
    ...(config.isDevelopment && { refreshToken }),
  });
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate refresh token and issue new access token
 *     security: []
 *     responses:
 *       200: { description: Token refreshed }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) throw require('../../core/ApiError').unauthorized(AUTH_MESSAGES.INVALID_TOKEN);

  const { accessToken, refreshToken } = await authService.refreshTokens(token);

  setRefreshCookie(res, refreshToken);
  ApiResponse.ok(res, AUTH_MESSAGES.TOKEN_REFRESHED, { accessToken });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Invalidate all sessions for the current user
 *     responses:
 *       200: { description: Logged out }
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  await authService.logout(req.user._id, refreshToken, req.tokenPayload);

  clearRefreshCookie(res);
  ApiResponse.ok(res, AUTH_MESSAGES.LOGOUT_SUCCESS);
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset link
 *     security: []
 */
const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  ApiResponse.ok(res, AUTH_MESSAGES.PASSWORD_RESET_SENT);
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using the emailed token
 *     security: []
 */
const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  ApiResponse.ok(res, AUTH_MESSAGES.PASSWORD_RESET_SUCCESS);
});

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password for the currently authenticated user
 */
const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body);
  clearRefreshCookie(res);
  ApiResponse.ok(res, AUTH_MESSAGES.PASSWORD_CHANGED);
});

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email address via token
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 */
const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  ApiResponse.ok(res, AUTH_MESSAGES.EMAIL_VERIFIED);
});

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend email verification link
 *     security: []
 */
const resendVerification = asyncHandler(async (req, res) => {
  await authService.sendVerificationEmail(req.body.email);
  ApiResponse.ok(res, AUTH_MESSAGES.EMAIL_VERIFICATION_SENT);
});

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Send OTP to the user's email
 *     security: []
 */
const sendOTP = asyncHandler(async (req, res) => {
  await authService.sendOTP(req.body.email);
  ApiResponse.ok(res, AUTH_MESSAGES.OTP_SENT);
});

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify a one-time password
 *     security: []
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const user = await authService.verifyOTP(req.body);
  ApiResponse.ok(res, AUTH_MESSAGES.OTP_VERIFIED, { userId: user._id });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently authenticated user's profile
 */
const me = asyncHandler(async (req, res) => {
  ApiResponse.ok(res, 'Profile retrieved', req.user);
});

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, changePassword, verifyEmail, resendVerification, sendOTP, verifyOTP, me };
