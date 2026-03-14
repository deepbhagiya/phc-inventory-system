const sequelize = require('./config/database');
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Transaction = require('./models/Transaction');
const Supplier = require('./models/Supplier');
const Reorder = require('./models/Reorder');
const AuditLog = require('./models/AuditLog');

// Define Relations here to ensure they exist before syncing
User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

Medicine.hasMany(Transaction, { foreignKey: 'medicineId' });
Transaction.belongsTo(Medicine, { foreignKey: 'medicineId' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

Medicine.belongsTo(Supplier, { foreignKey: 'supplierId' });
Supplier.hasMany(Medicine, { foreignKey: 'supplierId' });

Reorder.belongsTo(Medicine, { foreignKey: 'medicineId' });
Medicine.hasMany(Reorder, { foreignKey: 'medicineId' });

Reorder.belongsTo(Supplier, { foreignKey: 'supplierId' });
Supplier.hasMany(Reorder, { foreignKey: 'supplierId' });

const seedData = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Database Synced...');

        // Create Admin
        await User.create({
            username: 'admin',
            password: 'adminpassword',
            role: 'admin',
            fullName: 'System Administrator'
        });

        // Create Pharmacist
        await User.create({
            username: 'pharmacist',
            password: 'pharmacistpassword',
            role: 'staff',
            fullName: 'Head Pharmacist'
        });

        // Create Supplier
        const supplier = await Supplier.create({
            name: 'PharmaPlus Distributors',
            contactPerson: 'John Doe',
            email: 'supply@pharmaplus.com',
            phone: '555-0123',
            address: '123 Warehouse District'
        });

        // Create Medicines
        const paracetamol = await Medicine.create({
            name: 'Paracetamol 500mg',
            description: 'Pain reliever and fever reducer',
            quantity: 500,
            unit: 'tablets',
            expiryDate: '2027-12-31',
            minStockLevel: 100,
            supplierId: supplier.id
        });

        const amoxicillin = await Medicine.create({
            name: 'Amoxicillin 250mg',
            description: 'Antibiotic',
            quantity: 50,
            unit: 'capsules',
            expiryDate: '2027-06-30',
            minStockLevel: 20,
            supplierId: supplier.id
        });

        // Create Transactions
        await Transaction.create({
            type: 'IN',
            quantity: 500,
            reason: 'Initial Stock',
            userId: 1,
            medicineId: paracetamol.id
        });

        console.log('Data Seeded!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
