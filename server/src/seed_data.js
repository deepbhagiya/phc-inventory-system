const Medicine = require('./models/Medicine');
const Supplier = require('./models/Supplier');
const sequelize = require('./config/database');

const seed = async () => {
  try {
    await sequelize.sync();
    
    // Create a Supplier
    const supplier = await Supplier.create({
      name: 'National Pharma Corp',
      contactPerson: 'Mr. Rajesh',
      email: 'rajesh@pharma.com',
      phone: '9876543210'
    });

    // Create Initial Medicines
    await Medicine.bulkCreate([
      { name: 'Paracetamol 500mg', description: 'Pain relief and fever', quantity: 200, unit: 'tablets', expiryDate: '2027-12-31', minStockLevel: 50, supplierId: supplier.id },
      { name: 'Amoxicillin 250mg', description: 'Antibiotic for infections', quantity: 150, unit: 'capsules', expiryDate: '2026-06-30', minStockLevel: 30, supplierId: supplier.id },
      { name: 'Cetirizine 10mg', description: 'Allergy relief', quantity: 300, unit: 'tablets', expiryDate: '2027-01-15', minStockLevel: 40, supplierId: supplier.id },
      { name: 'Metformin 500mg', description: 'Diabetes medication', quantity: 500, unit: 'tablets', expiryDate: '2028-10-20', minStockLevel: 100, supplierId: supplier.id },
      { name: 'ORS Powder', description: 'Rehydration salts', quantity: 100, unit: 'sachets', expiryDate: '2027-05-22', minStockLevel: 20, supplierId: supplier.id }
    ]);

    console.log('✅ Seed successful! Medicines added.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
