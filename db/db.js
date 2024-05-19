const knex = require('knex');
const knexConfig = require('./knexfile');

const db = knex(knexConfig.development);

const connectDB = () => {
  db.raw('SELECT 1')
    .then(() => {
      console.log('Database connected');
    })
    .catch(err => {
      console.error('Database connection failed:', err);
    });
};

module.exports = {
  db,
  connectDB
};