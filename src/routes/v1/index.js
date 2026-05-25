'use strict';

const express = require('express');

const authRoutes = require('../../modules/auth/auth.routes');
const userRoutes = require('../../modules/users/user.routes');
const roleRoutes = require('../../modules/roles/role.routes');

const router = express.Router();

/**
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
router.get('/health', (req, res) =>
  res.json({
    success: true,
    message: 'OK',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    },
  }),
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);

module.exports = router;
