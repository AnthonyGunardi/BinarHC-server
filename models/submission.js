'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Submission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Submission.belongsTo(models.Mission, {foreignKey: 'mission_id', targetKey: 'id'})
      Submission.belongsTo(models.User, {foreignKey: 'employee_id', targetKey: 'id', as: 'Submitter'})
      Submission.belongsTo(models.User, {foreignKey: 'admin_id', targetKey: 'id', as: 'Grader'})
    }
  }
  Submission.init({
    description: DataTypes.TEXT,
    media: DataTypes.STRING,
    point: DataTypes.INTEGER,
    note: DataTypes.STRING,
    mission_id: DataTypes.INTEGER,
    employee_id: DataTypes.INTEGER,
    admin_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Submission',
  });
  return Submission;
};