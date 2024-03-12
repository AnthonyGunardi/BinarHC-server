'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Family extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Family.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
    }
  }
  Family.init({
    fullname: DataTypes.STRING,
    birthday: DataTypes.DATEONLY,
    status: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Family',
  });
  return Family;
};