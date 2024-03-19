'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User_Address.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
      User_Address.belongsTo(models.Address, {foreignKey: 'address_id', targetKey: 'id'})
    }
  }
  User_Address.init({
    user_id: DataTypes.INTEGER,
    address_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User_Address',
  });
  return User_Address;
};