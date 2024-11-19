'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Medicament extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Medicament.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    dosage: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Medicament',
  });
  return Medicament;
};