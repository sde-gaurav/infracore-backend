const mongoose = require('mongoose');

require('../config'); // load env
const config = require('../config');
const logger = require('../config/logger');
const { ROLES, ROLE_PERMISSIONS } = require('../constants/roles.constant');
const Role = require('../models/Role.model');
const User = require('../models/User.model');
const { hash } = require('../utils/bcrypt.util');

const SYSTEM_ROLES = [
  { name: ROLES.SUPER_ADMIN, displayName: 'Super Admin', description: 'Full system access', permissions: ROLE_PERMISSIONS[ROLES.SUPER_ADMIN], isSystem: true },
  { name: ROLES.ADMIN, displayName: 'Admin', description: 'Administrative access', permissions: ROLE_PERMISSIONS[ROLES.ADMIN], isSystem: true },
  { name: ROLES.MANAGER, displayName: 'Manager', description: 'Manager-level access', permissions: ROLE_PERMISSIONS[ROLES.MANAGER], isSystem: true },
  { name: ROLES.EMPLOYEE, displayName: 'Employee', description: 'Standard employee access', permissions: ROLE_PERMISSIONS[ROLES.EMPLOYEE], isSystem: true },
];

const seed = async () => {
  await mongoose.connect(config.mongo.uri);
  logger.info('Seeder: connected to MongoDB');

  // Seed roles
  await Promise.all(
    SYSTEM_ROLES.map((role) => Role.findOneAndUpdate({ name: role.name }, role, { upsert: true, new: true }).then(() => { logger.info(`Seeded role: ${role.name}`); })),
  );

  // Seed super admin user (only if none exists)
  const existingSuperAdmin = await User.findOne({ role: ROLES.SUPER_ADMIN });
  if (!existingSuperAdmin) {
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@infracore.dev',
      password: await hash('SuperAdmin@1234'),
      role: ROLES.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
    });
    logger.info('Seeded default super admin: superadmin@infracore.dev / SuperAdmin@1234');
  } else {
    logger.info('Super admin already exists — skipping');
  }

  await mongoose.disconnect();
  logger.info('Seeder: complete');
};

seed().catch((err) => {
  logger.error(`Seeder failed: ${err.message}`);
  process.exit(1);
});
