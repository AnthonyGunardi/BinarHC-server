'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Biodata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Biodata.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id', as: 'Biodata'})
      Biodata.belongsTo(models.Office, {foreignKey: 'office_id', targetKey: 'id'})
      Biodata.belongsTo(models.Position, {foreignKey: 'position_id', targetKey: 'id'})
      Biodata.belongsTo(models.Echelon, {foreignKey: 'echelon_id', targetKey: 'id'})
    }
  }
  Biodata.init({
    birthday: DataTypes.DATEONLY,
    hometown: DataTypes.STRING,
    hire_date: DataTypes.DATEONLY,
    religion: DataTypes.STRING,
    gender: DataTypes.STRING,
    last_education: DataTypes.STRING,
    job: DataTypes.TEXT,
    marital_status: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    office_id: DataTypes.INTEGER,
    position_id: DataTypes.INTEGER,
    echelon_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Biodata',
  });
  return Biodata;
};