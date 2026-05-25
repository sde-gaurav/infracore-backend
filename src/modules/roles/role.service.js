const { ROLE_MESSAGES } = require('../../constants/messages.constant');
const ApiError = require('../../core/ApiError');

const roleRepository = require('./role.repository');

const getRoles = () => roleRepository.findAllActive();

const getRoleById = async (id) => {
  const role = await roleRepository.findById(id);
  if (!role) throw ApiError.notFound(ROLE_MESSAGES.NOT_FOUND);
  return role;
};

const createRole = async (data) => {
  const existing = await roleRepository.findByName(data.name);
  if (existing) throw ApiError.conflict(ROLE_MESSAGES.NAME_EXISTS);
  return roleRepository.create(data);
};

const updateRole = async (id, data) => {
  const role = await roleRepository.findById(id);
  if (!role) throw ApiError.notFound(ROLE_MESSAGES.NOT_FOUND);
  if (role.isSystem) throw ApiError.forbidden('System roles cannot be modified');
  return roleRepository.updateById(id, data);
};

const deleteRole = async (id) => {
  const role = await roleRepository.findById(id);
  if (!role) throw ApiError.notFound(ROLE_MESSAGES.NOT_FOUND);
  if (role.isSystem) throw ApiError.forbidden('System roles cannot be deleted');
  return roleRepository.deleteById(id);
};

module.exports = { getRoles, getRoleById, createRole, updateRole, deleteRole };
