'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.pemesanan)
    }
  }
  user.init({
    id_user:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    nama_user: DataTypes.STRING,
    role: {
      type:DataTypes.ENUM('admin', 'resepsionis')
    },
    foto: DataTypes.TEXT,
    email: DataTypes.STRING,
    password: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'user',
    tableName: 'user'
  });
  return user;
};