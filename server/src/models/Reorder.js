const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reorder = sequelize.define('Reorder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Ordered', 'Received'),
    defaultValue: 'Pending'
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Reorder;
