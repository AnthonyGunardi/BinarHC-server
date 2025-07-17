'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Education_Request extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Education_Request.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
      Education_Request.belongsTo(models.Education, {foreignKey: 'education_id', targetKey: 'id'})
    }
  }
  Education_Request.init({
    status: DataTypes.STRING,
    admin_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    education_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Education_Request',
  });
  return Education_Request;
};