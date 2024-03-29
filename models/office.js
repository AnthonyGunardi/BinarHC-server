'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Office extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Office.hasMany(models.Biodata, {foreignKey: 'office_id', sourceKey: 'id'})
      Office.hasMany(models.Office_Address, {foreignKey: 'office_id', sourceKey: 'id'})
      Office.hasMany(models.Office_Phone, {foreignKey: 'office_id', sourceKey: 'id'})
    }
  }
  Office.init({
    name: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Office name is Required'
        },
        notNull: {
          msg: 'Office name is Required'
        }
      }
    },
    description: DataTypes.TEXT,
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notEmpty: {
          msg: `Slug is Required`
        },
        notNull: {
          msg: `Slug is Required`
        }
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Office',
  });
  return Office;
};