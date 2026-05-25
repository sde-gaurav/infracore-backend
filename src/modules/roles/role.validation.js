'use strict';

const Joi = require('joi');

const { ROLES, PERMISSIONS } = require('../../constants/roles.constant');
const { REGEX } = require('../../constants/regex.constant');

const idParam = {
  params: Joi.object({
    id: Joi.string().pattern(REGEX.MONGO_ID).required(),
  }),
};

const createRole = {
  body: Joi.object({
    name: Joi.string().valid(...Object.values(ROLES)).required(),
    displayName: Joi.string().trim().min(2).max(50).required(),
    description: Joi.string().trim().max(200).optional(),
    permissions: Joi.array().items(Joi.string().valid(...Object.values(PERMISSIONS))).default([]),
  }),
};

const updateRole = {
  params: idParam.params,
  body: Joi.object({
    displayName: Joi.string().trim().min(2).max(50),
    description: Joi.string().trim().max(200).allow(null, ''),
    permissions: Joi.array().items(Joi.string().valid(...Object.values(PERMISSIONS))),
    isActive: Joi.boolean(),
  }).min(1),
};

module.exports = { createRole, updateRole, idParam };
