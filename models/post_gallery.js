'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post_Gallery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post_Gallery.belongsTo(models.Post, {foreignKey: 'post_id', targetKey: 'id'})
    }
  }
  Post_Gallery.init({
    title: DataTypes.STRING,
    path: DataTypes.STRING,
    post_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Post_Gallery',
  });
  return Post_Gallery;
};