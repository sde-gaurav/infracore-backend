'use strict';

const { connectTestDB, disconnectTestDB, clearTestDB, createTestUser, createAdminUser } = require('../helpers/testHelpers');

jest.mock('../../cache/user.cache', () => ({
  getUserFromCache: jest.fn().mockResolvedValue(null),
  setUserInCache: jest.fn().mockResolvedValue(true),
  deleteUserFromCache: jest.fn().mockResolvedValue(true),
  invalidateUserListCache: jest.fn().mockResolvedValue(1),
  getUserListFromCache: jest.fn().mockResolvedValue(null),
  setUserListInCache: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../events/user.event', () => ({
  emitUserUpdated: jest.fn(),
  emitUserDeleted: jest.fn(),
}));

const userService = require('../../modules/users/user.service');
const { ROLES } = require('../../constants/roles.constant');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
afterEach(async () => { await clearTestDB(); });

describe('userService.getUsers', () => {
  it('returns paginated results', async () => {
    await Promise.all([createTestUser(), createTestUser(), createTestUser()]);
    const result = await userService.getUsers({ page: 1, limit: 2 });

    expect(result.data).toHaveLength(2);
    expect(result.pagination.total).toBeGreaterThanOrEqual(3);
    expect(result.pagination.hasNextPage).toBe(true);
  });

  it('filters by role', async () => {
    await createTestUser({ role: ROLES.EMPLOYEE });
    await createAdminUser();

    const result = await userService.getUsers({ role: ROLES.ADMIN });
    expect(result.data.every((u) => u.role === ROLES.ADMIN)).toBe(true);
  });
});

describe('userService.getUserById', () => {
  it('returns user for valid ID', async () => {
    const user = await createTestUser({ email: 'find@example.com' });
    const found = await userService.getUserById(user._id.toString());
    expect(found.email).toBe('find@example.com');
  });

  it('throws 404 for unknown ID', async () => {
    await expect(userService.getUserById('5f43a0d1c6d7b41720f17a59')).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('userService.updateUser', () => {
  it('updates firstName successfully', async () => {
    const user = await createTestUser({ email: 'update@example.com' });
    const updated = await userService.updateUser(user._id.toString(), { firstName: 'Changed' });
    expect(updated.firstName).toBe('Changed');
  });
});

describe('userService.deleteUser', () => {
  it('deletes user and returns the document', async () => {
    const user = await createTestUser({ email: 'delete@example.com' });
    const deleted = await userService.deleteUser(user._id.toString());
    expect(deleted._id.toString()).toBe(user._id.toString());
  });

  it('throws 404 for unknown user', async () => {
    await expect(userService.deleteUser('5f43a0d1c6d7b41720f17a59')).rejects.toMatchObject({ statusCode: 404 });
  });
});
