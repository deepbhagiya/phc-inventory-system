const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');
const Reorder = require('./models/Reorder');
const Supplier = require('./models/Supplier');
const AuditLog = require('./models/AuditLog');
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Transaction = require('./models/Transaction');

// Relations
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

// Connect to DB
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database connected...');
    // Auto-seed if no users exist
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('No users found. Seeding default users...');
      await User.create({
        username: 'admin',
        password: 'adminpassword',
        role: 'admin',
        fullName: 'System Administrator'
      });
      await User.create({
        username: 'pharmacist',
        password: 'pharmacistpassword',
        role: 'staff',
        fullName: 'Head Pharmacist'
      });
      console.log('Default users seeded.');
    }
  })
  .catch(err => console.log('Error: ' + err));

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/reorders', require('./routes/reorderRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
