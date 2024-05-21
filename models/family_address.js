'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Family_Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Family_Address.belongsTo(models.Family, {foreignKey: 'family_id', targetKey: 'id'})
      Family_Address.belongsTo(models.Address, {foreignKey: 'address_id', targetKey: 'id'})
    }
  }
  Family_Address.init({
    family_id: DataTypes.INTEGER,
    address_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Family_Address',
  });
  return Family_Address;
};