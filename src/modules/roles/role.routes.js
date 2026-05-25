'use strict';

const express = require('express');

const controller = require('./role.controller');
const validation = require('./role.validation');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles, requirePermission } = require('../../middlewares/permission.middleware');
const { ROLES, PERMISSIONS } = require('../../constants/roles.constant');

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.ROLE_READ), controller.getRoles);
router.get('/:id', requirePermission(PERMISSIONS.ROLE_READ), validate(validation.idParam), controller.getRoleById);

router.post('/', authorizeRoles(ROLES.SUPER_ADMIN), validate(validation.createRole), controller.createRole);
router.patch('/:id', authorizeRoles(ROLES.SUPER_ADMIN), validate(validation.updateRole), controller.updateRole);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN), validate(validation.idParam), controller.deleteRole);

module.exports = router;
