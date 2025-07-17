'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Leaderboard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Leaderboard.init({
    balance: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    year: DataTypes.STRING,
    month: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Leaderboard',
  });
  return Leaderboard;
};