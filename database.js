const { Sequelize } = require('sequelize');

// Configuration de la base de données
const sequelize = new Sequelize('database_name', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'  // ou 'mysql', 'sqlite', 'mariadb', 'mssql'
});

module.exports = sequelize;
