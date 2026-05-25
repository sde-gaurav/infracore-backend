const crypto = require('crypto');

const { v4: uuidv4 } = require('uuid');

const { storeRefreshToken, revokeRefreshToken, revokeAllUserTokens, blockAccessToken, trackTokenFamily, getTokenFamily, invalidateTokenFamily } = require('../../cache/token.cache');
const { AUTH_MESSAGES } = require('../../constants/messages.constant');
const ApiError = require('../../core/ApiError');
const userEvents = require('../../events/user.event');
const emailQueue = require('../../queues/email.queue');
const { hash, compare } = require('../../utils/bcrypt.util');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt.util');
const { generateOTP, getOTPExpiry, isOTPExpired } = require('../../utils/otp.util');
const { generateSecureToken, hashToken, tokenExpiry } = require('../../utils/token.util');

const authRepository = require('./auth.repository');

const issueTokenPair = async (user, meta = {}) => {
  const jti = uuidv4();
  const payload = { sub: user._id.toString(), role: user.role, email: user.email, jti };

  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken({ sub: user._id.toString(), jti }),
  ]);

  const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Promise.all([
    authRepository.saveRefreshToken({
      userId: user._id,
      token: refreshToken,
      expiresAt: refreshExpiry,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    }),
    storeRefreshToken(user._id.toString(), jti),
  ]);

  return { accessToken, refreshToken };
};

const register = async ({ firstName, lastName, email, password, phone }) => {
  const existing = await authRepository.findByEmail(email);
  if (existing) throw ApiError.conflict(AUTH_MESSAGES.EMAIL_EXISTS || 'Email already registered');

  const hashedPassword = await hash(password);
  const verificationToken = generateSecureToken();
  const hashedVerificationToken = hashToken(verificationToken);

  const user = await authRepository.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpires: tokenExpiry(60 * 24), // 24 hours
  });

  await emailQueue.addEmailVerificationJob({ user: user.toJSON(), token: verificationToken });

  return user;
};

const login = async ({ email, password }, meta = {}) => {
  const user = await authRepository.findByEmail(email);
  if (!user) throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);

  const isMatch = await compare(password, user.password);
  if (!isMatch) throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);

  if (!user.isActive) throw ApiError.forbidden(AUTH_MESSAGES.ACCOUNT_DISABLED);
  if (!user.isEmailVerified) throw ApiError.forbidden(AUTH_MESSAGES.ACCOUNT_NOT_VERIFIED);

  const tokens = await issueTokenPair(user, meta);
  await authRepository.updateLoginMeta(user._id, meta.ipAddress);

  userEvents.emitUserLoggedIn(user);

  return { user, ...tokens };
};

const refreshTokens = async (token) => {
  const decoded = await verifyRefreshToken(token).catch(() => {
    throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_TOKEN);
  });

  const storedToken = await authRepository.findRefreshToken(token);
  if (!storedToken || storedToken.isRevoked) {
    // Potential token reuse — revoke the entire user's session
    if (decoded.sub) await revokeAllUserTokens(decoded.sub);
    throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_TOKEN);
  }

  const user = await authRepository.findActiveUserById(decoded.sub);
  if (!user) throw ApiError.unauthorized(AUTH_MESSAGES.UNAUTHORIZED);

  // Rotate: revoke old token, issue new pair
  await authRepository.revokeRefreshToken(storedToken._id);

  return issueTokenPair(user, {
    userAgent: storedToken.userAgent,
    ipAddress: storedToken.ipAddress,
  });
};

const logout = async (userId, refreshToken, accessTokenPayload) => {
  await Promise.allSettled([
    authRepository.revokeAllUserRefreshTokens(userId),
    revokeAllUserTokens(userId.toString()),
    // Block the current access token until its natural expiry
    accessTokenPayload?.jti && accessTokenPayload?.exp
      ? blockAccessToken(accessTokenPayload.jti, accessTokenPayload.exp - Math.floor(Date.now() / 1000))
      : Promise.resolve(),
  ]);
};

const forgotPassword = async (email) => {
  const user = await authRepository.findByEmail(email);
  if (!user) return; // Don't reveal whether email exists

  const resetToken = generateSecureToken();
  const hashedToken = hashToken(resetToken);

  await authRepository.updateById(user._id, {
    passwordResetToken: hashedToken,
    passwordResetExpires: tokenExpiry(30), // 30 minutes
  });

  await emailQueue.addPasswordResetJob({ user: user.toJSON(), token: resetToken });
};

const resetPassword = async ({ token, password }) => {
  const hashedToken = hashToken(token);
  const user = await authRepository.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
    isActive: true,
  });

  if (!user) throw ApiError.badRequest(AUTH_MESSAGES.INVALID_TOKEN);

  const hashedPassword = await hash(password);

  await authRepository.updateById(user._id, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
    passwordResetToken: null,
    passwordResetExpires: null,
  });

  // Invalidate all existing sessions
  await revokeAllUserTokens(user._id.toString());
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await authRepository.findByEmail(
    (await authRepository.findById(userId)).email,
  );

  const isMatch = await compare(currentPassword, user.password);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

  const hashedPassword = await hash(newPassword);

  await authRepository.updateById(userId, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
  });

  await revokeAllUserTokens(userId.toString());
};

const verifyEmail = async (token) => {
  const hashedToken = hashToken(token);
  const user = await authRepository.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) throw ApiError.badRequest(AUTH_MESSAGES.INVALID_TOKEN);

  await authRepository.updateById(user._id, {
    isEmailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpires: null,
  });

  return user;
};

const sendVerificationEmail = async (email) => {
  const user = await authRepository.findOne({ email, isEmailVerified: false });
  if (!user) throw ApiError.badRequest('User not found or already verified');

  const verificationToken = generateSecureToken();
  const hashedVerificationToken = hashToken(verificationToken);

  await authRepository.updateById(user._id, {
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpires: tokenExpiry(60 * 24),
  });

  await emailQueue.addEmailVerificationJob({ user: user.toJSON(), token: verificationToken });
};

const sendOTP = async (email) => {
  const user = await authRepository.findOne({ email, isActive: true });
  if (!user) throw ApiError.notFound(AUTH_MESSAGES.UNAUTHORIZED);

  const otp = generateOTP();
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  await authRepository.updateById(user._id, {
    otpCode: hashedOTP,
    otpExpires: getOTPExpiry(),
  });

  await emailQueue.addOTPJob({ user: user.toJSON(), otp });
};

const verifyOTP = async ({ email, otp }) => {
  const user = await authRepository.findOne({ email });
  if (!user || !user.otpCode) throw ApiError.badRequest(AUTH_MESSAGES.INVALID_TOKEN);

  if (isOTPExpired(user.otpExpires)) throw ApiError.badRequest(AUTH_MESSAGES.TOKEN_EXPIRED);

  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(user.otpCode), Buffer.from(hashedOTP))) {
    throw ApiError.badRequest(AUTH_MESSAGES.INVALID_TOKEN);
  }

  await authRepository.updateById(user._id, { otpCode: null, otpExpires: null });

  return user;
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  sendVerificationEmail,
  sendOTP,
  verifyOTP,
};
