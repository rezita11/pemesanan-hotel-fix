'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pemesanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user,{
        foreignKey: "id_user",
        as: "user"
      })
      this.belongsTo(models.kamar,{
        foreignKey: "id_tipe_kamar",
        as: "kamar"
      })
    }
  }
  pemesanan.init({
    id_pemesanan:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    nomor_pemesanan: DataTypes.INTEGER,
    nama_pemesan: DataTypes.STRING,
    email_pemesan: DataTypes.STRING,
    tgl_pemesanan: DataTypes.DATE,
    tgl_check_in: DataTypes.DATE,
    tgl_check_out: DataTypes.DATE,
    nama_tamu: DataTypes.STRING,
    jumlah_kamar: DataTypes.INTEGER,
    id_tipe_kamar: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status_pemesanan: {
      type:DataTypes.ENUM,
      values:['baru','check_in','check_out']
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, 
  {
    sequelize,
    modelName: 'pemesanan',
    tableName: 'pemesanan'
  });
  return pemesanan;
};