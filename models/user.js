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
      User.hasOne(models.Biodata, {foreignKey: 'user_id', sourceKey: 'id', as: 'Biodata'})
      User.hasOne(models.Point, {foreignKey: 'user_id', sourceKey: 'id'})
      User.hasMany(models.Point_Log, {foreignKey: 'user_id', sourceKey: 'id', as: 'Obtained_Point_Log'})
      User.hasMany(models.Point_Log, {foreignKey: 'admin_id', sourceKey: 'id', as: 'Approved_Point_Log'})
      User.hasMany(models.Reward, {foreignKey: 'user_id', sourceKey: 'id', as: 'Author'})
      User.hasMany(models.Reward_Log, {foreignKey: 'user_id', sourceKey: 'id', as: 'Obtained_Reward_Log'})
      User.hasMany(models.Reward_Log, {foreignKey: 'admin_id', sourceKey: 'id', as: 'Approved_Reward_Log'})
      User.hasMany(models.Post, {foreignKey: 'user_id', sourceKey: 'id'})
      User.hasMany(models.Family, {foreignKey: 'user_id', sourceKey: 'id'})
      User.hasMany(models.User_Address, {foreignKey: 'user_id', sourceKey: 'id'})
      User.hasMany(models.User_Phone, {foreignKey: 'user_id', sourceKey: 'id'})
      User.belongsToMany(models.Position, {through: 'User_Position'})
      User.hasMany(models.Overtime, {foreignKey: 'employee_id', sourceKey: 'id', as: 'Overtime_Request'})
      User.hasMany(models.Overtime, {foreignKey: 'admin_id', sourceKey: 'id', as: 'Overtime_Approval'})
    }
  }
  User.init({
    fullname: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Full name is Required'
        },
        notNull: {
          msg: 'Full name is Required'
        }
      }
    },
    nip: {
      type: DataTypes.STRING,
      allowNull:false,
      unique:true,
      defaultValue: Date.now().toString(36),
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
      defaultValue: '123456',
      validate: {
        notEmpty: {
          msg: `Password is Required`
        },
        notNull: {
          msg: `Password is Required`
        }
      }
    },
    id_card: DataTypes.STRING,
    photo: DataTypes.STRING,
    is_admin: {
      type: DataTypes.ENUM,
      values: ['active', 'pending', 'deleted'],
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'User'
  });
  return User;
};