const express = require('express');

const { ROLES } = require('../../constants/roles.constant');
const { PERMISSIONS } = require('../../constants/roles.constant');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles, requirePermission, authorizeOwnerOrRole } = require('../../middlewares/permission.middleware');
const { avatarUpload } = require('../../middlewares/upload.middleware');
const validate = require('../../middlewares/validate.middleware');

const controller = require('./user.controller');
const validation = require('./user.validation');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Self-service profile routes
router.get('/profile', controller.getProfile);
router.patch('/profile', validate(validation.updateUser), controller.updateProfile);
router.post('/avatar', avatarUpload.single('avatar'), controller.uploadAvatar);

// Admin and above — read all users
router.get('/', requirePermission(PERMISSIONS.USER_READ), validate(validation.getAll), controller.getUsers);
router.get('/:id', requirePermission(PERMISSIONS.USER_READ), validate(validation.getById), controller.getUserById);

// Manager and above — create / update users
router.patch(
  '/:id',
  authorizeOwnerOrRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(validation.updateUser),
  controller.updateUser,
);

// Admin and above — role management
router.patch(
  '/:id/role',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(validation.updateRole),
  controller.updateRole,
);

router.patch(
  '/:id/deactivate',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(validation.getById),
  controller.deactivateUser,
);

// Super admin only — hard delete
router.delete(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN),
  validate(validation.deleteUser),
  controller.deleteUser,
);

module.exports = router;
