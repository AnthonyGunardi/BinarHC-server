'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.belongsTo(models.Post, {foreignKey: 'post_id', targetKey: 'id'})
    }
  }
  Event.init({
    title: DataTypes.STRING,
    url: DataTypes.STRING,
    point: DataTypes.INTEGER,
    published_at: DataTypes.DATE,
    post_id: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};