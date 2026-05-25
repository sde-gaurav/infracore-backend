'use strict';

const mongoose = require('mongoose');

const { ROLES, PERMISSIONS } = require('../constants/roles.constant');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      lowercase: true,
      trim: true,
      enum: { values: Object.values(ROLES), message: 'Invalid role name' },
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    permissions: {
      type: [String],
      enum: { values: Object.values(PERMISSIONS), message: 'Invalid permission' },
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ isActive: 1 });

roleSchema.statics.findByName = function findByName(name) {
  return this.findOne({ name: name.toLowerCase() });
};

roleSchema.methods.hasPermission = function hasPermission(permission) {
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('Role', roleSchema);
