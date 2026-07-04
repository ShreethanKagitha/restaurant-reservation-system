const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/restaurant_reservations')
  .then(async () => {
    const admin = await User.findOne({ email: 'admin@reservetable.com' }).select('+password');
    if (admin) {
      console.log('Admin password field:', admin.password);
      console.log('Is it hashed?', admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'));
    } else {
      console.log('Admin not found in local DB.');
    }
    process.exit(0);
  });
