const { Sequelize, DataTypes } = require('sequelize');

// Configuration de la base de données
const sequelize = new Sequelize('database_name', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres'  // Changez à 'mysql' si vous utilisez MySQL, etc.
});

// Définition du modèle User pour stocker les informations personnelles de l'utilisateur
const User = sequelize.define('User', {
  userId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users'
});

// Définition du modèle WebPushToken pour stocker les tokens de notification push de l'utilisateur
const WebPushToken = sequelize.define('WebPushToken', {
  tokenId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'userId'
    }
  }
}, {
  tableName: 'web_push_tokens'
});

// Définir l'association entre les modèles User et WebPushToken
User.hasMany(WebPushToken, { foreignKey: 'userId' });
WebPushToken.belongsTo(User, { foreignKey: 'userId' });

// Exporter les modèles et l'instance de Sequelize pour être utilisés dans d'autres parties de l'application
module.exports = { sequelize, User, WebPushToken };
