'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Office_Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Office_Address.belongsTo(models.Office, {foreignKey: 'office_id', targetKey: 'id'})
      Office_Address.belongsTo(models.Address, {foreignKey: 'address_id', targetKey: 'id'})
    }
  }
  Office_Address.init({
    office_id: DataTypes.INTEGER,
    address_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Office_Address',
  });
  return Office_Address;
};