'use strict';

const AUTH_MESSAGES = Object.freeze({
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTER_SUCCESS: 'Registration successful. Please verify your email.',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  EMAIL_VERIFICATION_SENT: 'Verification email sent',
  OTP_SENT: 'OTP sent to your email',
  OTP_VERIFIED: 'OTP verified successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  ACCOUNT_DISABLED: 'Your account has been disabled. Contact support.',
  ACCOUNT_NOT_VERIFIED: 'Please verify your email to continue',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',
});

const USER_MESSAGES = Object.freeze({
  FETCH_SUCCESS: 'Users retrieved successfully',
  FETCH_ONE_SUCCESS: 'User retrieved successfully',
  CREATE_SUCCESS: 'User created successfully',
  UPDATE_SUCCESS: 'User updated successfully',
  DELETE_SUCCESS: 'User deleted successfully',
  NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'An account with this email already exists',
  PROFILE_UPDATED: 'Profile updated successfully',
  AVATAR_UPLOADED: 'Avatar uploaded successfully',
});

const ROLE_MESSAGES = Object.freeze({
  FETCH_SUCCESS: 'Roles retrieved successfully',
  FETCH_ONE_SUCCESS: 'Role retrieved successfully',
  CREATE_SUCCESS: 'Role created successfully',
  UPDATE_SUCCESS: 'Role updated successfully',
  DELETE_SUCCESS: 'Role deleted successfully',
  NOT_FOUND: 'Role not found',
  NAME_EXISTS: 'A role with this name already exists',
  ASSIGNED: 'Role assigned successfully',
  REVOKED: 'Role revoked successfully',
});

const GENERIC_MESSAGES = Object.freeze({
  SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Validation failed',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  ROUTE_NOT_FOUND: 'Route not found',
});

module.exports = { AUTH_MESSAGES, USER_MESSAGES, ROLE_MESSAGES, GENERIC_MESSAGES };
