'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Phone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User_Phone.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
      User_Phone.belongsTo(models.Phone, {foreignKey: 'phone_id', targetKey: 'id'})
    }
  }
  User_Phone.init({
    user_id: DataTypes.INTEGER,
    phone_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User_Phone',
  });
  return User_Phone;
};