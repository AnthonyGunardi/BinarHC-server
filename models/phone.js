'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Phone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Phone.hasMany(models.Office_Phone, {foreignKey: 'phone_id', sourceKey: 'id'})
      Phone.hasMany(models.User_Phone, {foreignKey: 'phone_id', sourceKey: 'id'})
      Phone.hasMany(models.Family_Phone, {foreignKey: 'phone_id', sourceKey: 'id'})
    }
  }
  Phone.init({
    code: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    is_main: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Phone',
  });
  return Phone;
};