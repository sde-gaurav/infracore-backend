'use strict';

const BaseRepository = require('../../core/BaseRepository');
const User = require('../../models/User.model');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  searchUsers(searchTerm, filters = {}) {
    const regex = new RegExp(searchTerm, 'i');
    return User.find({
      ...filters,
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ],
    });
  }
}

module.exports = new UserRepository();
