'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reward_Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Reward_Log.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id', as:"Reward_Log"})
      Reward_Log.belongsTo(models.User, {foreignKey: 'admin_id', targetKey: 'id', as: "Approved_Reward_Log"})
      Reward_Log.belongsTo(models.Reward, {foreignKey: 'reward_id', targetKey: 'id'})
    }
  }
  Reward_Log.init({
    status: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Reward Log status is Required'
        },
        notNull: {
          msg: 'Reward Log status is Required'
        }
      }
    },
    reward_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    admin_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Reward_Log',
  });
  return Reward_Log;
};