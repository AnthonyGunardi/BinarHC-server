'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Indonesia_Village extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Indonesia_Village.belongsTo(models.Indonesia_District, {foreignKey: 'district_id', targetKey: 'id'})
    }
  }
  Indonesia_Village.init({
    name: DataTypes.TEXT,
    district_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Indonesia_Village',
    tableName: 'indonesia_villages',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscore: true,
  });
  return Indonesia_Village;
};