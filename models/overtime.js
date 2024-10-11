'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Overtime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Overtime.belongsTo(models.User, {foreignKey: 'employee_id', targetKey: 'id', as:"Overtime_Request"})
      Overtime.belongsTo(models.User, {foreignKey: 'admin_id', targetKey: 'id', as: "Overtime_Approval"})
    }
  }
  Overtime.init({
    date: DataTypes.DATEONLY,
    clock_in: DataTypes.TIME,
    clock_out: DataTypes.TIME,
    status: DataTypes.STRING,
    photo: DataTypes.STRING,
    meta: DataTypes.TEXT,
    note: DataTypes.TEXT,
    employee_id: DataTypes.INTEGER,
    admin_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Overtime',
  });
  return Overtime;
};