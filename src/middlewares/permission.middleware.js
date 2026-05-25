'use strict';

const ApiError = require('../core/ApiError');
const { ROLE_HIERARCHY, ROLE_PERMISSIONS } = require('../constants/roles.constant');
const { AUTH_MESSAGES } = require('../constants/messages.constant');

/**
 * Restricts access to users with one of the specified roles.
 * Roles are compared by hierarchy: a higher role inherits lower-role access.
 *
 * @param {...string} allowedRoles — e.g. authorizeRoles('admin', 'super_admin')
 */
const authorizeRoles = (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized(AUTH_MESSAGES.UNAUTHORIZED));

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(AUTH_MESSAGES.FORBIDDEN));
    }

    return next();
  };

/**
 * Restricts access based on a minimum role level in the hierarchy.
 * e.g. requireMinRole('manager') allows manager, admin, and super_admin.
 */
const requireMinRole = (minRole) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized(AUTH_MESSAGES.UNAUTHORIZED));

    const userIndex = ROLE_HIERARCHY.indexOf(req.user.role);
    const minIndex = ROLE_HIERARCHY.indexOf(minRole);

    if (userIndex < minIndex) {
      return next(ApiError.forbidden(AUTH_MESSAGES.FORBIDDEN));
    }

    return next();
  };

/**
 * Permission-based guard using the ROLE_PERMISSIONS map.
 * @param {string} permission — e.g. 'user:delete'
 */
const requirePermission = (permission) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized(AUTH_MESSAGES.UNAUTHORIZED));

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    if (!userPermissions.includes(permission)) {
      return next(ApiError.forbidden(`Missing required permission: ${permission}`));
    }

    return next();
  };

/**
 * Allows a user to only affect their own resources, unless they have a higher role.
 * @param {string} paramKey — the route param holding the target user ID (default: 'id')
 */
const authorizeOwnerOrRole = (...adminRoles) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized(AUTH_MESSAGES.UNAUTHORIZED));

    const targetId = req.params.id || req.params.userId;
    const isSelf = targetId && req.user._id.toString() === targetId;
    const hasRole = adminRoles.includes(req.user.role);

    if (isSelf || hasRole) return next();
    return next(ApiError.forbidden(AUTH_MESSAGES.FORBIDDEN));
  };

module.exports = { authorizeRoles, requireMinRole, requirePermission, authorizeOwnerOrRole };
