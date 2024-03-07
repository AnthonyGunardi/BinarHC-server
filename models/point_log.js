'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Point_Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Point_Log.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id', as:"Obtained_Point_Log"})
      Point_Log.belongsTo(models.User, {foreignKey: 'admin_id', targetKey: 'id', as: "Approved_Point_Log"})
    }
  }
  Point_Log.init({
    type: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Point Log type is Required'
        },
        notNull: {
          msg: 'Point Log type is Required'
        }
      }
    },
    point: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Point Log value is Required'
        },
        notNull: {
          msg: 'Point Log value is Required'
        }
      }
    },
    description: DataTypes.TEXT,
    user_id: DataTypes.INTEGER,
    admin_id: DataTypes.INTEGER,
    last_balance: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Point_Log',
  });
  return Point_Log;
};