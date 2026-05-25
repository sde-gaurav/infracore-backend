const { USER_MESSAGES } = require('../../constants/messages.constant');
const ApiResponse = require('../../core/ApiResponse');
const asyncHandler = require('../../core/asyncHandler');

const userService = require('./user.service');

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Retrieve a paginated list of users
 *     parameters:
 *       - { in: query, name: page,   schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,  schema: { type: integer, default: 10 } }
 *       - { in: query, name: sort,   schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: role,   schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated user list
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaginatedResponse' }
 */
const getUsers = asyncHandler(async (req, res) => {
  const { data, pagination } = await userService.getUsers(req.query);
  ApiResponse.paginated(res, USER_MESSAGES.FETCH_SUCCESS, data, pagination);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a single user by ID
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: User found }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  ApiResponse.ok(res, USER_MESSAGES.FETCH_ONE_SUCCESS, user);
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get the currently authenticated user's full profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id.toString());
  ApiResponse.ok(res, USER_MESSAGES.FETCH_ONE_SUCCESS, user);
});

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     tags: [Users]
 *     summary: Update the authenticated user's own profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user._id.toString(), req.body);
  ApiResponse.ok(res, USER_MESSAGES.PROFILE_UPDATED, user);
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update any user (admin+)
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  ApiResponse.ok(res, USER_MESSAGES.UPDATE_SUCCESS, user);
});

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Update a user's role (admin+)
 */
const updateRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role);
  ApiResponse.ok(res, USER_MESSAGES.UPDATE_SUCCESS, user);
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Hard-delete a user (super_admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  ApiResponse.ok(res, USER_MESSAGES.DELETE_SUCCESS);
});

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     tags: [Users]
 *     summary: Soft-deactivate a user account (admin+)
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.deactivateUser(req.params.id);
  ApiResponse.ok(res, USER_MESSAGES.UPDATE_SUCCESS, user);
});

/**
 * @swagger
 * /users/avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload a profile avatar
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw require('../../core/ApiError').badRequest('No file uploaded');
  const user = await userService.updateAvatar(req.user._id.toString(), req.file.path);
  ApiResponse.ok(res, USER_MESSAGES.AVATAR_UPLOADED, { avatar: user.avatar });
});

module.exports = { getUsers, getUserById, getProfile, updateProfile, updateUser, updateRole, deleteUser, deactivateUser, uploadAvatar };
