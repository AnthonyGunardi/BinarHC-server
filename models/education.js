'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Education extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Education.hasMany(models.Sub_Education, {foreignKey: 'education_id', targetKey: 'id'})
      Education.hasMany(models.Schedule, {foreignKey: 'education_id', targetKey: 'id'})
      Education.hasMany(models.User_Education, {foreignKey: 'education_id', targetKey: 'id'})
      Education.hasMany(models.Education_Request, {foreignKey: 'education_id', targetKey: 'id'})
    }
  }
  Education.init({
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
    certification: DataTypes.STRING,
    is_restream: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_active: DataTypes.BOOLEAN,
    publish_date: DataTypes.DATEONLY,
    publish_time: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'Education',
  });
  return Education;
};