'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Posts.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
      Posts.hasOne(models.Events, {foreignKey: 'post_id', sourceKey: 'id'})
    }
  }
  Posts.init({
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    description: DataTypes.TEXT,
    type: DataTypes.STRING,
    publishied_at: DataTypes.DATE,
    user_id: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Posts',
  });
  return Posts;
};