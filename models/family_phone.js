'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Family_Phone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Family_Phone.belongsTo(models.Family, {foreignKey: 'family_id', targetKey: 'id'})
      Family_Phone.belongsTo(models.Phone, {foreignKey: 'phone_id', targetKey: 'id'})
    }
  }
  Family_Phone.init({
    family_id: DataTypes.INTEGER,
    phone_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Family_Phone',
  });
  return Family_Phone;
};