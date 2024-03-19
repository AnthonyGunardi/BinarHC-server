'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Address.hasMany(models.User_Address, {foreignKey: 'address_id', sourceKey: 'id'})
      Address.hasMany(models.Office_Address, {foreignKey: 'address_id', sourceKey: 'id'})
      Address.belongsTo(models.Indonesia_Village, {foreignKey: 'village_id', targetKey: 'id'})
    }
  }
  Address.init({
    name: DataTypes.TEXT,
    postal_code: DataTypes.STRING,
    meta: DataTypes.TEXT,
    is_main: DataTypes.BOOLEAN,
    village_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Address',
  });
  return Address;
};