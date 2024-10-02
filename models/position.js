'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Position extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Position.belongsToMany(models.User, {through: 'User_Position'})
    }
  }
  Position.init({
    title: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Position title is Required'
        },
        notNull: {
          msg: 'Position title is Required'
        }
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notEmpty: {
          msg: `Slug is Required`
        },
        notNull: {
          msg: `Slug is Required`
        }
      }
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Position',
  });
  return Position;
};