const cache = require('./index');

const USER_TTL = 900; // 15 min
const USER_KEY = (id) => `user:${id}`;
const USER_LIST_PATTERN = 'users:list:*';

const getUserFromCache = (userId) => cache.get(USER_KEY(userId));

const setUserInCache = (userId, userData) => cache.set(USER_KEY(userId), userData, USER_TTL);

const deleteUserFromCache = (userId) => cache.del(USER_KEY(userId));

const invalidateUserListCache = () => cache.delPattern(USER_LIST_PATTERN);

const getUserListKey = (query) => `users:list:${JSON.stringify(query)}`;

const getUserListFromCache = (query) => cache.get(getUserListKey(query));

const setUserListInCache = (query, data) => cache.set(getUserListKey(query), data, 300); // 5 min

module.exports = {
  getUserFromCache,
  setUserInCache,
  deleteUserFromCache,
  invalidateUserListCache,
  getUserListFromCache,
  setUserListInCache,
};
