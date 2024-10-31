'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Master_Data extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Master_Data.init({
    annual_leave: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Master_Data',
  });
  return Master_Data;
};