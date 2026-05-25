'use strict';

const { connectTestDB, disconnectTestDB, clearTestDB } = require('../helpers/testHelpers');
const { hash } = require('../../utils/bcrypt.util');
const { generateOTP } = require('../../utils/otp.util');
const { hashToken } = require('../../utils/token.util');

// Mock external side-effects
jest.mock('../../queues/email.queue', () => ({
  addEmailVerificationJob: jest.fn().mockResolvedValue({}),
  addPasswordResetJob: jest.fn().mockResolvedValue({}),
  addOTPJob: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../events/user.event', () => ({
  emitUserLoggedIn: jest.fn(),
  emitUserRegistered: jest.fn(),
  emitUserUpdated: jest.fn(),
}));

jest.mock('../../cache/token.cache', () => ({
  storeRefreshToken: jest.fn().mockResolvedValue(true),
  revokeRefreshToken: jest.fn().mockResolvedValue(true),
  revokeAllUserTokens: jest.fn().mockResolvedValue(true),
  blockAccessToken: jest.fn().mockResolvedValue(true),
  isAccessTokenBlocked: jest.fn().mockResolvedValue(false),
  trackTokenFamily: jest.fn().mockResolvedValue(true),
  getTokenFamily: jest.fn().mockResolvedValue(null),
  invalidateTokenFamily: jest.fn().mockResolvedValue(true),
}));

const authService = require('../../modules/auth/auth.service');
const User = require('../../models/User.model');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
afterEach(async () => { await clearTestDB(); });

describe('authService.register', () => {
  it('creates a new user and returns the document', async () => {
    const user = await authService.register({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Pass@1234',
    });
    expect(user.email).toBe('jane@example.com');
    expect(user.isEmailVerified).toBe(false);
  });

  it('throws 409 when email already exists', async () => {
    await authService.register({ firstName: 'A', lastName: 'B', email: 'dup@example.com', password: 'Pass@1234' });
    await expect(
      authService.register({ firstName: 'A', lastName: 'B', email: 'dup@example.com', password: 'Pass@1234' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('authService.login', () => {
  beforeEach(async () => {
    await User.create({
      firstName: 'Login',
      lastName: 'User',
      email: 'loginuser@example.com',
      password: await hash('Pass@1234'),
      isEmailVerified: true,
      isActive: true,
    });
  });

  it('returns tokens for valid credentials', async () => {
    const result = await authService.login({ email: 'loginuser@example.com', password: 'Pass@1234' });
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('throws 401 for wrong password', async () => {
    await expect(
      authService.login({ email: 'loginuser@example.com', password: 'WrongPass@1' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws 403 for unverified account', async () => {
    await User.create({
      firstName: 'Unverified',
      lastName: 'User',
      email: 'unverified@example.com',
      password: await hash('Pass@1234'),
      isEmailVerified: false,
      isActive: true,
    });
    await expect(
      authService.login({ email: 'unverified@example.com', password: 'Pass@1234' }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('authService.verifyEmail', () => {
  it('verifies email with valid token', async () => {
    const { generateSecureToken, hashToken: ht, tokenExpiry } = require('../../utils/token.util');
    const token = generateSecureToken();
    await User.create({
      firstName: 'Ver',
      lastName: 'User',
      email: 'verify@example.com',
      password: await hash('Pass@1234'),
      emailVerificationToken: ht(token),
      emailVerificationExpires: tokenExpiry(60),
      isActive: true,
    });

    const user = await authService.verifyEmail(token);
    expect(user).toBeDefined();

    const updated = await User.findOne({ email: 'verify@example.com' });
    expect(updated.isEmailVerified).toBe(true);
  });

  it('throws for expired token', async () => {
    await expect(authService.verifyEmail('invalid-token')).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('generateOTP utility', () => {
  it('generates correct length numeric OTP', () => {
    const otp = generateOTP(6);
    expect(otp).toHaveLength(6);
    expect(/^\d+$/.test(otp)).toBe(true);
  });

  it('generates unique OTPs', () => {
    const set = new Set(Array.from({ length: 100 }, () => generateOTP(6)));
    expect(set.size).toBeGreaterThan(80);
  });
});
