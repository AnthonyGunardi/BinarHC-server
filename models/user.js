'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Reward, {foreignKey: 'user_id', sourceKey: 'id'})
      User.hasMany(models.Reward_Log, {foreignKey: 'user_id', sourceKey: 'id', as: 'Reward_Log'})
      User.hasMany(models.Reward_Log, {foreignKey: 'admin_id', sourceKey: 'id', as: 'Approved_Reward_Log'})
      User.hasMany(models.Point, {foreignKey: 'user_id', sourceKey: 'id'})
    }
  }
  User.init({
    firstname: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'First name is Required'
        },
        notNull: {
          msg: 'First name is Required'
        }
      }
    },
    lastname: DataTypes.STRING,
    nip: {
      type: DataTypes.STRING,
      allowNull:false,
      unique:true,
      validate: {
        notEmpty: {
          msg: 'NIP is Required'
        },
        notNull: {
          msg: 'NIP is Required'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull:false,
      unique:true,
      validate: {
        notEmpty: {
          msg: 'Email is Required'
        },
        notNull: {
          msg: 'Email is Required'
        },
        isEmail: {
          msg: 'Email address is not valid'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: `Password is Required`
        },
        notNull: {
          msg: `Password is Required`
        }
      }
    },
    photo: DataTypes.STRING,
    is_admin: DataTypes.BOOLEAN,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};