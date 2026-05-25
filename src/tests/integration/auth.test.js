const request = require('supertest');

const app = require('../../app');
const { connectTestDB, disconnectTestDB, clearTestDB, createTestUser } = require('../helpers/testHelpers');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('POST /api/v1/auth/register', () => {
  const endpoint = '/api/v1/auth/register';

  const validPayload = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'Test@1234',
    confirmPassword: 'Test@1234',
  };

  it('registers a new user successfully', async () => {
    const res = await request(app).post(endpoint).send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBeDefined();
  });

  it('rejects duplicate email', async () => {
    await request(app).post(endpoint).send(validPayload);
    const res = await request(app).post(endpoint).send(validPayload);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app).post(endpoint).send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('rejects mismatched passwords', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ ...validPayload, confirmPassword: 'different' });
    expect(res.status).toBe(400);
  });

  it('rejects weak password', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ ...validPayload, password: '12345678', confirmPassword: '12345678' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  const endpoint = '/api/v1/auth/login';

  beforeEach(async () => {
    await createTestUser({ email: 'login@example.com' });
  });

  it('returns tokens for valid credentials', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ email: 'login@example.com', password: 'Test@1234' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ email: 'login@example.com', password: 'WrongPass@1' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ email: 'nobody@example.com', password: 'Test@1234' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns the authenticated user profile', async () => {
    const user = await createTestUser({ email: 'me@example.com' });
    const { generateTestToken } = require('../helpers/testHelpers');
    const token = await generateTestToken(user);

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('me@example.com');
  });

  it('returns 401 for unauthenticated request', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/forgot-password', () => {
  it('always returns 200 regardless of email existence (security)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });
    expect(res.status).toBe(200);
  });
});
