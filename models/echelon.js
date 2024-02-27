'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Echelon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Echelon.hasMany(models.Biodata, {foreignKey: 'echelon_id', sourceKey: 'id'})
    }
  }
  Echelon.init({
    title: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Echelon title is Required'
        },
        notNull: {
          msg: 'Echelon title is Required'
        }
      }
    },
    code: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Echelon code is Required'
        },
        notNull: {
          msg: 'Echelon code is Required'
        }
      }
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Echelon',
  });
  return Echelon;
};