const path = require('path');

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: 'localhost',
      user: 'hona',
      password: '',
      database: 'back'
    },
    migrations: {
      tableName: 'knex_migrations',
      directory:  path.join(__dirname, './migrations')
    }
  }
};
