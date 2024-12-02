'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Attendance.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
    }
  }
  Attendance.init({
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate:{
        notEmpty: {
          msg: `Date is Required`
        },
        notNull: {
          msg: `Date is Required`
        }
      }
    },
    is_present: DataTypes.BOOLEAN,
    clock_in: {
      type: DataTypes.TIME,
      allowNull: false,
      validate:{
        notEmpty: {
          msg: `Clock_in is Required`
        },
        notNull: {
          msg: `Clock_in is Required`
        }
      }
    },
    clock_out: DataTypes.TIME,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notEmpty: {
          msg: `Work Status is Required`
        },
        notNull: {
          msg: `Work Status is Required`
        }
      }
    },
    photo: DataTypes.STRING,
    meta: DataTypes.STRING,
    location_in: DataTypes.STRING,
    meta_out: DataTypes.STRING,
    location_out: DataTypes.STRING,
    note: DataTypes.TEXT,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  return Attendance;
};