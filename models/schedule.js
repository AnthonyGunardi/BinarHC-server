'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Schedule.belongsTo(models.Education, {foreignKey: 'education_id', targetKey: 'id'})
    }
  }
  Schedule.init({
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
    link: DataTypes.STRING,
    publish_date: DataTypes.DATEONLY,
    publish_time: DataTypes.TIME,
    is_active: DataTypes.BOOLEAN,
    education_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Schedule',
  });
  return Schedule;
};