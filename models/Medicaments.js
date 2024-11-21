'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Medicaments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Medicaments.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    dosage: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Medicaments',
  });
  return Medicaments;
};