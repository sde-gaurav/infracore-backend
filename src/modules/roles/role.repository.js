'use strict';

const BaseRepository = require('../../core/BaseRepository');
const Role = require('../../models/Role.model');

class RoleRepository extends BaseRepository {
  constructor() {
    super(Role);
  }

  findByName(name) {
    return Role.findOne({ name: name.toLowerCase() });
  }

  findAllActive() {
    return Role.find({ isActive: true }).sort({ name: 1 }).lean();
  }
}

module.exports = new RoleRepository();
