const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medicine = sequelize.define('Medicine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'tablets'
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  minStockLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
});
// SupplierId is added automatically by index.js associations, but good to have context here if needed.
// However, sequelize associations can handle foreign keys without explicit column definitions if defined early.
// Given strict setup, we should rely on Sequelize sync in seed.js to add the column.

module.exports = Medicine;
