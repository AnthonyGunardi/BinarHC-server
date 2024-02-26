'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Indonesia_City extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Indonesia_City.belongsTo(models.Indonesia_Province, {foreignKey: 'province_id', targetKey: 'id'})
    }
  }
  Indonesia_City.init({
    name: DataTypes.STRING,
    province_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Indonesia_City',
    tableName: 'indonesia_cities',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscore: true,
  });
  return Indonesia_City;
};