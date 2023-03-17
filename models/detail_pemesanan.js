'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detail_pemesanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.pemesanan),{
        foreignKey: "id_pemesanan",
        as: "pemesanan"
      }
      this.belongsTo(models.kamar),{
        foreignKey: "id_kamar",
        as: "kamar"
      }
    }
  }
  detail_pemesanan.init({
    id_detail_pemesanan:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    id_pemesanan: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_kamar: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tgl_akses: DataTypes.DATE,
    harga: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'detail_pemesanan',
    tableName: 'detail_pemesanan'
  });
  return detail_pemesanan;
};