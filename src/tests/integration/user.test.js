const request = require('supertest');

const app = require('../../app');
const {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestUser,
  createAdminUser,
  authHeader,
} = require('../helpers/testHelpers');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
afterEach(async () => { await clearTestDB(); });

describe('GET /api/v1/users', () => {
  it('allows admin to list users', async () => {
    const admin = await createAdminUser();
    const headers = await authHeader(admin);

    await createTestUser();
    await createTestUser();

    const res = await request(app).get('/api/v1/users').set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.meta.pagination).toBeDefined();
  });

  it('denies access to regular employees', async () => {
    const employee = await createTestUser();
    const headers = await authHeader(employee);
    const res = await request(app).get('/api/v1/users').set(headers);
    expect(res.status).toBe(403);
  });

  it('returns 401 for unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/users/:id', () => {
  it('fetches a specific user by ID (admin)', async () => {
    const admin = await createAdminUser();
    const target = await createTestUser({ email: 'target@example.com' });
    const headers = await authHeader(admin);

    const res = await request(app).get(`/api/v1/users/${target._id}`).set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('target@example.com');
  });

  it('returns 404 for unknown ID', async () => {
    const admin = await createAdminUser();
    const headers = await authHeader(admin);
    const fakeId = '5f43a0d1c6d7b41720f17a59';

    const res = await request(app).get(`/api/v1/users/${fakeId}`).set(headers);
    expect(res.status).toBe(404);
  });

  it('returns 400 for malformed ObjectId', async () => {
    const admin = await createAdminUser();
    const headers = await authHeader(admin);

    const res = await request(app).get('/api/v1/users/not-an-id').set(headers);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/users/profile', () => {
  it("returns the authenticated user's own profile", async () => {
    const user = await createTestUser({ email: 'profile@example.com' });
    const headers = await authHeader(user);

    const res = await request(app).get('/api/v1/users/profile').set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('profile@example.com');
  });
});

describe('PATCH /api/v1/users/profile', () => {
  it('updates own profile fields', async () => {
    const user = await createTestUser({ email: 'patch@example.com' });
    const headers = await authHeader(user);

    const res = await request(app)
      .patch('/api/v1/users/profile')
      .set(headers)
      .send({ firstName: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe('Updated');
  });
});
