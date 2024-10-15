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
      Overtime.belongsTo(models.User, {foreignKey: 'employee_id', targetKey: 'id', as:"Overtime_Requester"})
      Overtime.belongsTo(models.User, {foreignKey: 'admin_id', targetKey: 'id', as: "Overtime_Approver"})
    }
  }
  Overtime.init({
    start_time: {
      type:DataTypes.DATE,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Start Time is Required'
        },
        notNull: {
          msg: 'Start Time is Required'
        }
      }
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'End Time is Required'
        },
        notNull: {
          msg: 'End Time is Required'
        }
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Overtime Type is Required'
        },
        notNull: {
          msg: 'Overtime Type is Required'
        }
      }
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    photo: DataTypes.STRING,
    meta: DataTypes.TEXT,
    note: DataTypes.TEXT,
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Employee ID is Required'
        },
        notNull: {
          msg: 'Employee ID is Required'
        }
      }
    },
    admin_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Overtime',
  });
  return Overtime;
};