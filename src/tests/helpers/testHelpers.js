const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const { ROLES } = require('../../constants/roles.constant');
const User = require('../../models/User.model');
const { hash } = require('../../utils/bcrypt.util');
const { generateAccessToken } = require('../../utils/jwt.util');

let mongoServer;

const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: API health check
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: OK }
 *                 data:
 *                   type: object
 *                   properties:
 *                     uptime: { type: number }
 *                     timestamp: { type: string }
 *                     environment: { type: string }
 */
};

const clearTestDB = async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((col) => col.deleteMany({})));
};

const createTestUser = async (overrides = {}) => {
  const defaults = {
    firstName: 'Test',
    lastName: 'User',
    email: `test-${Date.now()}@example.com`,
    password: await hash('Test@1234'),
    role: ROLES.EMPLOYEE,
    isEmailVerified: true,
    isActive: true,
  };
  return User.create({ ...defaults, ...overrides });
};

const createAdminUser = (overrides = {}) => createTestUser({ role: ROLES.ADMIN, email: `admin-${Date.now()}@example.com`, ...overrides });

const createSuperAdmin = (overrides = {}) => createTestUser({ role: ROLES.SUPER_ADMIN, email: `superadmin-${Date.now()}@example.com`, ...overrides });

const generateTestToken = async (user) => generateAccessToken({ sub: user._id.toString(), role: user.role, email: user.email, jti: 'test-jti' });

const authHeader = async (user) => ({
  Authorization: `Bearer ${await generateTestToken(user)}`,
});

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestUser,
  createAdminUser,
  createSuperAdmin,
  generateTestToken,
  authHeader,
};
