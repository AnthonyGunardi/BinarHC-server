'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employment_Periode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Employment_Periode.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
      Employment_Periode.belongsTo(models.Employment_Status, {foreignKey: 'status_id', targetKey: 'id'})
    }
  };
  Employment_Periode.init({
    user_id: DataTypes.INTEGER,
    status_id: DataTypes.INTEGER,
    period: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'Employment_Periode',
  });
  return Employment_Periode;
};