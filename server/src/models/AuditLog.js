const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action: {
    type: DataTypes.STRING, // e.g., 'ADD_MEDICINE', 'UPDATE_STOCK'
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT // JSON string or description
  },
  ipAddress: {
    type: DataTypes.STRING
  }
});

module.exports = AuditLog;
