const knex = require('knex')(require('../db/knexfile').development);

const createUser = async (user) => {
  return await knex('users').insert(user);
};

const findUserByEmail = async (email) => {
  return await knex('users').where({ email }).first();
};

const findUserById = async (id) => {
  return await knex('users').where({ id }).first();
};

const updateUser = async (id, user) => {
  return await knex('users').where({ id }).update(user);
};

const updateUserByEmail = async (email, user) => {
  return await knex('users').where({ email }).update(user);
};

const deleteUser = async (id) => {
  return await knex('users').where({ id }).del();
};

const getAllUsers = async (filters, limit, offset) => {
  let query = knex('users').select('id', 'name', 'email', 'role').limit(limit).offset(offset);
  if (filters.role) {
    query = query.where({ role: filters.role });
  }
  return await query;
};

const countUsers = async (filters) => {
  let query = knex('users').count('id as count');
  if (filters.role) {
    query = query.where({ role: filters.role });
  }
  const result = await query;
  return result[0].count;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updateUserByEmail,
  deleteUser,
  getAllUsers,
  countUsers
};
