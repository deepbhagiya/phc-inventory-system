const Medicine = require('../models/Medicine');
const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const AuditLog = require('../models/AuditLog');
const Reorder = require('../models/Reorder');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const sequelize = require('../config/database');

// Helper for audit logging
const logAudit = async (userId, action, details = '') => {
  try {
    await AuditLog.create({ userId, action, details: JSON.stringify(details) });
  } catch (err) {
    console.error('Audit Log Error', err);
  }
};

exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.findAll({ include: Supplier });
    res.json(medicines);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.addMedicine = async (req, res) => {
  try {
    const { name, description, quantity, unit, expiryDate, minStockLevel, supplierId } = req.body;
    const newMedicine = await Medicine.create({
      name, description, quantity, unit, expiryDate, minStockLevel, supplierId
    });
    
    // Log transaction
    await Transaction.create({
        type: 'IN',
        quantity: quantity,
        reason: 'Initial Stock',
        transactionDate: new Date(),
        userId: req.user.user.id,
        medicineId: newMedicine.id
    });

    await logAudit(req.user.user.id, 'ADD_MEDICINE', { medicineName: name, quantity });

    res.json(newMedicine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, quantity, reason } = req.body;
        
        const medicine = await Medicine.findByPk(id);
        if(!medicine) return res.status(404).json({ msg: 'Medicine not found' });

        // Expiry Check for OUT
        if (type === 'OUT') {
            const today = new Date().toISOString().split('T')[0];
            if (medicine.expiryDate < today) {
                return res.status(400).json({ msg: 'Cannot issue expired medicine!' });
            }
            if(medicine.quantity < quantity) {
                return res.status(400).json({ msg: 'Insufficient stock' });
            }
        }

        if(type === 'IN') {
            medicine.quantity += parseInt(quantity);
        } else {
            medicine.quantity -= parseInt(quantity);
        }
        
        await medicine.save();

        // Auto Reorder Logic
        if (medicine.quantity <= medicine.minStockLevel) {
            const existingOrder = await Reorder.findOne({ 
                where: { medicineId: medicine.id, status: 'Pending' } 
            });
            
            if (!existingOrder) {
                await Reorder.create({
                    medicineId: medicine.id,
                    quantity: medicine.minStockLevel * 2, 
                    supplierId: medicine.supplierId,
                    status: 'Pending'
                });
                // Log system action? Or just user action triggering it
            }
        }

        await Transaction.create({
            type,
            quantity,
            reason,
            transactionDate: new Date(),
            userId: req.user.user.id,
            medicineId: medicine.id
        });

        await logAudit(req.user.user.id, 'UPDATE_STOCK', { type, quantity, medicine: medicine.name });

        res.json(medicine);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        await Medicine.destroy({ where: { id } });
        res.json({ msg: 'Medicine removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getLowStockAlerts = async (req, res) => {
    try {
        const alerts = await Medicine.findAll({
            where: {
                quantity: {
                    [Op.lte]: sequelize.col('minStockLevel')
                }
            }
        });
        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [
                { model: User, attributes: ['username'] },
                { model: Medicine, attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.dispenseMedicines = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items, patientName, patientAge, patientGender, patientContact, doctorName } = req.body;
        const referenceId = uuidv4();
        const userId = req.user.user.id;

        // 1. Validate Stock
        for (const item of items) {
            const medicine = await Medicine.findByPk(item.medicineId, { transaction: t });
            if (!medicine) {
                await t.rollback();
                return res.status(404).json({ msg: `Medicine ID ${item.medicineId} not found` });
            }
            const today = new Date().toISOString().split('T')[0];
            if (medicine.expiryDate < today) {
                await t.rollback();
                return res.status(400).json({ msg: `${medicine.name} has expired!` });
            }
            if (medicine.quantity < item.quantity) {
                await t.rollback();
                return res.status(400).json({ msg: `Insufficient stock for ${medicine.name}` });
            }
        }

        // 2. Execute Updates
        const transactions = [];
        for (const item of items) {
            const medicine = await Medicine.findByPk(item.medicineId, { transaction: t });
            
            medicine.quantity -= item.quantity;
            await medicine.save({ transaction: t });

            const transaction = await Transaction.create({
                type: 'OUT',
                quantity: item.quantity,
                reason: 'Issued to Patient',
                patientName,
                patientAge,
                patientGender,
                patientContact,
                doctorName,
                referenceId,
                transactionDate: new Date(),
                userId,
                medicineId: medicine.id
            }, { transaction: t });
            
            transactions.push(transaction);

            // Reorder Check
            if (medicine.quantity <= medicine.minStockLevel) {
                 const existingOrder = await Reorder.findOne({ 
                    where: { medicineId: medicine.id, status: 'Pending' },
                    transaction: t
                });
                if (!existingOrder) {
                    await Reorder.create({
                        medicineId: medicine.id,
                        quantity: medicine.minStockLevel * 2,
                        supplierId: medicine.supplierId,
                        status: 'Pending'
                    }, { transaction: t });
                }
            }
        }

        await t.commit();
        await logAudit(userId, 'ISSUE_MEDICINE', { patient: patientName, count: items.length, ref: referenceId });
        res.json({ msg: 'Success', referenceId });

    } catch (err) {
        await t.rollback();
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
