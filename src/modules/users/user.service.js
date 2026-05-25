'use strict';

const userRepository = require('./user.repository');
const { getUserFromCache, setUserInCache, deleteUserFromCache, invalidateUserListCache } = require('../../cache/user.cache');
const ApiError = require('../../core/ApiError');
const { USER_MESSAGES } = require('../../constants/messages.constant');
const userEvents = require('../../events/user.event');

const getUsers = async (queryParams) => {
  const { page, limit, sort, search, ...filters } = queryParams;

  const paginationOpts = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
    sort: sort ? sort.split(',').reduce((acc, f) => { acc[f.replace(/^-/, '')] = f.startsWith('-') ? -1 : 1; return acc; }, {}) : { createdAt: -1 },
  };

  if (search) {
    const regex = new RegExp(search, 'i');
    filters.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
  }

  return userRepository.paginate(filters, paginationOpts);
};

const getUserById = async (id) => {
  const cached = await getUserFromCache(id);
  if (cached) return cached;

  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound(USER_MESSAGES.NOT_FOUND);

  await setUserInCache(id, user.toJSON());
  return user;
};

const updateUser = async (id, updateData) => {
  const user = await userRepository.updateById(id, updateData);
  await Promise.all([deleteUserFromCache(id), invalidateUserListCache()]);
  userEvents.emitUserUpdated(user);
  return user;
};

const updateUserRole = async (id, role) => {
  const user = await userRepository.updateById(id, { role });
  await deleteUserFromCache(id);
  return user;
};

const deactivateUser = async (id) => {
  const user = await userRepository.updateById(id, { isActive: false });
  await deleteUserFromCache(id);
  return user;
};

const deleteUser = async (id) => {
  const user = await userRepository.deleteById(id);
  await Promise.all([deleteUserFromCache(id), invalidateUserListCache()]);
  return user;
};

const updateAvatar = async (userId, avatarPath) => {
  const user = await userRepository.updateById(userId, { avatar: avatarPath });
  await deleteUserFromCache(userId);
  return user;
};

module.exports = { getUsers, getUserById, updateUser, updateUserRole, deactivateUser, deleteUser, updateAvatar };
