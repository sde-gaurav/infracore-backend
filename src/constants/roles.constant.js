'use strict';

const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
});

// Ordered hierarchy: higher index = higher authority
const ROLE_HIERARCHY = [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN];

const PERMISSIONS = Object.freeze({
  // User management
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Role management
  ROLE_READ: 'role:read',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  // Auth
  AUTH_MANAGE: 'auth:manage',

  // Audit
  AUDIT_READ: 'audit:read',
});

const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.EMPLOYEE]: [PERMISSIONS.USER_READ],
  [ROLES.MANAGER]: [PERMISSIONS.USER_READ, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_UPDATE],
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.AUDIT_READ,
  ],
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
});

module.exports = { ROLES, ROLE_HIERARCHY, PERMISSIONS, ROLE_PERMISSIONS };
