const { ROLE_MESSAGES } = require('../../constants/messages.constant');
const ApiResponse = require('../../core/ApiResponse');
const asyncHandler = require('../../core/asyncHandler');

const roleService = require('./role.service');

/**
 * @swagger
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: List all active roles
 *     responses:
 *       200: { description: Roles list }
 */
const getRoles = asyncHandler(async (req, res) => {
  const roles = await roleService.getRoles();
  ApiResponse.ok(res, ROLE_MESSAGES.FETCH_SUCCESS, roles);
});

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get a single role by ID
 */
const getRoleById = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  ApiResponse.ok(res, ROLE_MESSAGES.FETCH_ONE_SUCCESS, role);
});

/**
 * @swagger
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create a new role (super_admin only)
 */
const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body);
  ApiResponse.created(res, ROLE_MESSAGES.CREATE_SUCCESS, role);
});

/**
 * @swagger
 * /roles/{id}:
 *   patch:
 *     tags: [Roles]
 *     summary: Update a role (super_admin only)
 */
const updateRole = asyncHandler(async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body);
  ApiResponse.ok(res, ROLE_MESSAGES.UPDATE_SUCCESS, role);
});

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete a non-system role (super_admin only)
 */
const deleteRole = asyncHandler(async (req, res) => {
  await roleService.deleteRole(req.params.id);
  ApiResponse.ok(res, ROLE_MESSAGES.DELETE_SUCCESS);
});

module.exports = { getRoles, getRoleById, createRole, updateRole, deleteRole };
