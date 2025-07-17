'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sub_Education extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Sub_Education.belongsTo(models.Education, {foreignKey: 'education_id', targetKey: 'id'})
    }
  }
  Sub_Education.init({
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
    link: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    education_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Sub_Education',
  });
  return Sub_Education;
};