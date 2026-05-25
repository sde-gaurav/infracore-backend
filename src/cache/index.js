const logger = require('../config/logger');
const { getClient } = require('../database/redis');

const DEFAULT_TTL = 3600; // 1 hour

const get = async (key) => {
  try {
    const value = await getClient().get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    logger.warn(`Cache GET error for key "${key}": ${err.message}`);
    return null;
  }
};

const set = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    await getClient().set(key, JSON.stringify(value), 'EX', ttl);
    return true;
  } catch (err) {
    logger.warn(`Cache SET error for key "${key}": ${err.message}`);
    return false;
  }
};

const del = async (key) => {
  try {
    await getClient().del(key);
    return true;
  } catch (err) {
    logger.warn(`Cache DEL error for key "${key}": ${err.message}`);
    return false;
  }
};

const delPattern = async (pattern) => {
  try {
    const keys = await getClient().keys(pattern);
    if (keys.length > 0) {
      await getClient().del(...keys);
    }
    return keys.length;
  } catch (err) {
    logger.warn(`Cache DEL pattern error for "${pattern}": ${err.message}`);
    return 0;
  }
};

const exists = async (key) => {
  try {
    return (await getClient().exists(key)) === 1;
  } catch {
    return false;
  }
};

const increment = async (key, amount = 1) => {
  try {
    return getClient().incrby(key, amount);
  } catch (err) {
    logger.warn(`Cache INCR error: ${err.message}`);
    return null;
  }
};

const setWithNX = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    const result = await getClient().set(key, JSON.stringify(value), 'EX', ttl, 'NX');
    return result === 'OK';
  } catch (err) {
    logger.warn(`Cache SETNX error: ${err.message}`);
    return false;
  }
};

const getOrSet = async (key, fetchFn, ttl = DEFAULT_TTL) => {
  const cached = await get(key);
  if (cached !== null) return cached;
  const fresh = await fetchFn();
  if (fresh !== null && fresh !== undefined) await set(key, fresh, ttl);
  return fresh;
};

module.exports = { get, set, del, delPattern, exists, increment, setWithNX, getOrSet, DEFAULT_TTL };
