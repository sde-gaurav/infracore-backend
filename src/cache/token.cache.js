const cache = require('./index');

const REFRESH_TOKEN_PREFIX = 'rt:';
const BLOCKLIST_PREFIX = 'jwt:block:';
const TOKEN_FAMILY_PREFIX = 'rt:family:';

const REFRESH_TTL = 7 * 24 * 3600; // 7 days

const storeRefreshToken = (userId, tokenId, ttl = REFRESH_TTL) => cache.set(`${REFRESH_TOKEN_PREFIX}${userId}:${tokenId}`, true, ttl);

const isRefreshTokenValid = async (userId, tokenId) => {
  const val = await cache.get(`${REFRESH_TOKEN_PREFIX}${userId}:${tokenId}`);
  return val === true;
};

const revokeRefreshToken = (userId, tokenId) => cache.del(`${REFRESH_TOKEN_PREFIX}${userId}:${tokenId}`);

const revokeAllUserTokens = (userId) => cache.delPattern(`${REFRESH_TOKEN_PREFIX}${userId}:*`);

const blockAccessToken = (jti, ttlSeconds) => cache.set(`${BLOCKLIST_PREFIX}${jti}`, true, ttlSeconds);

const isAccessTokenBlocked = async (jti) => {
  const val = await cache.get(`${BLOCKLIST_PREFIX}${jti}`);
  return val === true;
};

const trackTokenFamily = (familyId, tokenId) => cache.set(`${TOKEN_FAMILY_PREFIX}${familyId}`, tokenId, REFRESH_TTL);

const getTokenFamily = (familyId) => cache.get(`${TOKEN_FAMILY_PREFIX}${familyId}`);

const invalidateTokenFamily = (familyId) => cache.del(`${TOKEN_FAMILY_PREFIX}${familyId}`);

module.exports = {
  storeRefreshToken,
  isRefreshTokenValid,
  revokeRefreshToken,
  revokeAllUserTokens,
  blockAccessToken,
  isAccessTokenBlocked,
  trackTokenFamily,
  getTokenFamily,
  invalidateTokenFamily,
};
