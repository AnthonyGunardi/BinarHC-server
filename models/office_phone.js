'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Office_Phone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Office_Phone.belongsTo(models.Office, {foreignKey: 'office_id', targetKey: 'id'})
      Office_Phone.belongsTo(models.Phone, {foreignKey: 'phone_id', targetKey: 'id'})
    }
  }
  Office_Phone.init({
    office_id: DataTypes.INTEGER,
    phone_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Office_Phone',
  });
  return Office_Phone;
};