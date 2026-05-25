const Joi = require('joi');

const { REGEX } = require('../../constants/regex.constant');
const { ROLES } = require('../../constants/roles.constant');

const getAll = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100)
      .default(10),
    sort: Joi.string().optional(),
    fields: Joi.string().optional(),
    search: Joi.string().optional(),
    role: Joi.string().valid(...Object.values(ROLES)).optional(),
    isActive: Joi.boolean().optional(),
  }),
};

const getById = {
  params: Joi.object({
    id: Joi.string().pattern(REGEX.MONGO_ID).required().messages({
      'string.pattern.base': 'Invalid user ID format',
    }),
  }),
};

const updateUser = {
  params: getById.params,
  body: Joi.object({
    firstName: Joi.string().trim().min(2).max(50),
    lastName: Joi.string().trim().min(2).max(50),
    phone: Joi.string().pattern(REGEX.PHONE).allow(null, ''),
    metadata: Joi.object().optional(),
  }).min(1),
};

const updateRole = {
  params: getById.params,
  body: Joi.object({
    role: Joi.string().valid(...Object.values(ROLES)).required(),
  }),
};

const deleteUser = {
  params: getById.params,
};

module.exports = { getAll, getById, updateUser, updateRole, deleteUser };
