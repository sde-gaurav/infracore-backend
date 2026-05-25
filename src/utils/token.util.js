const crypto = require('crypto');

/**
 * Generates a cryptographically secure random token (hex encoded).
 */
const generateSecureToken = (byteLength = 32) => crypto.randomBytes(byteLength).toString('hex');

/**
 * Hashes a token for storage. We store the hash, send the plain token to users.
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Returns expiry Date for a given duration in minutes.
 */
const tokenExpiry = (minutes) => new Date(Date.now() + minutes * 60 * 1000);

module.exports = { generateSecureToken, hashToken, tokenExpiry };
