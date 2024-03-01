'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Indonesia_District extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Indonesia_District.belongsTo(models.Indonesia_City, {foreignKey: 'city_id', targetKey: 'id'})
      Indonesia_District.hasMany(models.Indonesia_Village, {foreignKey: 'district_id', sourceKey: 'id'})
    }
  }
  Indonesia_District.init({
    name: DataTypes.TEXT,
    city_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Indonesia_District',
    tableName: 'indonesia_districts',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscore: true,
  });
  return Indonesia_District;
};