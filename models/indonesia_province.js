'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Indonesia_Province extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Indonesia_Province.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Indonesia_Province',
    tableName: 'indonesia_provinces',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscore: true,
  });
  return Indonesia_Province;
};