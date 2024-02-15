'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Events extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Events.belongsTo(models.Posts, {foreignKey: 'post_id', targetKey: 'id'})
    }
  }
  Events.init({
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    url: DataTypes.STRING,
    point: DataTypes.INTEGER,
    publishied_at: DataTypes.DATE,
    post_id: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Events',
  });
  return Events;
};