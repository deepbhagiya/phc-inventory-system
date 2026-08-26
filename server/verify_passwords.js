const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function verify() {
  const user = await User.findOne({ where: { username: 'admin' } });
  if (!user) {
    console.log('User admin not found');
    return;
  }
  const match = await bcrypt.compare('adminpassword', user.password);
  console.log(`Password 'adminpassword' matches for admin: ${match}`);
  
  const staff = await User.findOne({ where: { username: 'pharmacist' } });
  if (staff) {
    const match2 = await bcrypt.compare('pharmacistpassword', staff.password);
    console.log(`Password 'pharmacistpassword' matches for pharmacist: ${match2}`);
  }
  process.exit(0);
}

verify();
