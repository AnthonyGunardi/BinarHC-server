'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mission.hasMany(models.Mission_Gallery, {foreignKey: 'mission_id', sourceKey: 'id'})
      Mission.hasOne(models.Mission_Url, {foreignKey: 'mission_id', sourceKey: 'id'})
      Mission.hasMany(models.Submission, {foreignKey: 'mission_id', sourceKey: 'id'})
    }
  }
  Mission.init({
    title: DataTypes.STRING,
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
    thumbnail: DataTypes.STRING,
    type: DataTypes.STRING,
    published_at: DataTypes.DATE,
    expired_at: DataTypes.DATE,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Mission',
  });
  return Mission;
};