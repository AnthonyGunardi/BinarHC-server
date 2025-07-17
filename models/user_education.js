'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Education extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User_Education.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
      User_Education.belongsTo(models.Education, {foreignKey: 'education_id', targetKey: 'id'})
    }
  }
  User_Education.init({
    certificate: DataTypes.STRING,
    is_graduate: DataTypes.BOOLEAN,
    user_id: DataTypes.INTEGER,
    education_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User_Education',
  });
  return User_Education;
};