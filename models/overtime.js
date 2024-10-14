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
    date: {
      type: DataTypes.DATEONLY,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Overtime Date is Required'
        },
        notNull: {
          msg: 'Overtime Date is Required'
        }
      }
    },
    clock_in: {
      type:DataTypes.TIME,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Clock In is Required'
        },
        notNull: {
          msg: 'Clock In is Required'
        }
      }
    },
    clock_out: {
      type: DataTypes.TIME,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Clock Out is Required'
        },
        notNull: {
          msg: 'Clock Out is Required'
        }
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Overtime Status is Required'
        },
        notNull: {
          msg: 'Overtime Status is Required'
        }
      }
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