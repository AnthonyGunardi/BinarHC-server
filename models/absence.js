'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Absence extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Absence.belongsTo(models.User, {foreignKey: 'employee_id', targetKey: 'id', as:"Absence_Requester"})
      Absence.belongsTo(models.User, {foreignKey: 'admin_id', targetKey: 'id', as: "Absence_Approver"})
    }
  }
  Absence.init({
    start_date: {
      type:DataTypes.DATEONLY,
      allowNull: false,
      validate:{
        notEmpty: {
          msg: `Start Date is Required`
        },
        notNull: {
          msg: `Start Date is Required`
        }
      }
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate:{
        notEmpty: {
          msg: `End Date is Required`
        },
        notNull: {
          msg: `End Date is Required`
        }
      }
    },
    photo: DataTypes.STRING,
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notEmpty: {
          msg: `Absence type is Required`
        },
        notNull: {
          msg: `Absence type is Required`
        }
      }
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Pending',
    },
    note: DataTypes.TEXT,
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate:{
        notEmpty: {
          msg: `Employee ID is Required`
        },
        notNull: {
          msg: `Employee ID is Required`
        }
      }
    },
    admin_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Absence',
  });
  return Absence;
};