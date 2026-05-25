const express = require('express');

const authRoutes = require('../../modules/auth/auth.routes');
const roleRoutes = require('../../modules/roles/role.routes');
const userRoutes = require('../../modules/users/user.routes');

const router = express.Router();

router.get('/health', (req, res) => res.json({
  success: true,
  message: 'OK',
  data: {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  },
}));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);

module.exports = router;
