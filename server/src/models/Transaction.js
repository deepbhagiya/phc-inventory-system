const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('IN', 'OUT'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING
  },
  // Patient Details for OUT transactions
  patientName: { type: DataTypes.STRING },
  patientAge: { type: DataTypes.INTEGER },
  patientGender: { type: DataTypes.ENUM('Male', 'Female', 'Other') },
  patientContact: { type: DataTypes.STRING },
  doctorName: { type: DataTypes.STRING },
  
  referenceId: {
    type: DataTypes.STRING // UUID to group multiple items
  },
  transactionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Transaction;
