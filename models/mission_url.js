'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mission_Url extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Mission_Url.init({
    title: DataTypes.STRING,
    url: DataTypes.STRING,
    mission_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Mission_Url',
  });
  return Mission_Url;
};