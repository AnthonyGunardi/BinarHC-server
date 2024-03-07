'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reward extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Reward.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id', as: 'Author'})
      Reward.hasMany(models.Reward_Log, {foreignKey: 'reward_id', sourceKey: 'id'})
    }
  }
  Reward.init({
    title: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Title is Required'
        },
        notNull: {
          msg: 'Title is Required'
        }
      }
    },
    description: DataTypes.TEXT,
    point: {
      type: DataTypes.INTEGER,
      allowNull:false,
      defaultValue: 0,
      validate: {
        notEmpty: {
          msg: 'Point is Required'
        },
        notNull: {
          msg: 'Point is Required'
        }
      }
    },
    photo: DataTypes.STRING,
    published_at: DataTypes.DATE,
    expired_at: DataTypes.DATE,
    user_id: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Reward',
  });
  return Reward;
};