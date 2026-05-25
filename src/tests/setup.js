// Must run before config is loaded
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters!!';
process.env.COOKIE_SECRET = 'test-cookie-secret-min-32-characters!!';
process.env.MONGO_URI_TEST = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/infracore_test';
process.env.REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';

module.exports = async () => {
  // Global setup runs once before all test suites
};
