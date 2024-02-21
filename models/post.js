'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
      Post.hasOne(models.Event, {foreignKey: 'post_id', sourceKey: 'id'})
    }
  }
  Post.init({
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
    description: DataTypes.TEXT,
    type: DataTypes.STRING,
    published_at: DataTypes.DATE,
    user_id: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};