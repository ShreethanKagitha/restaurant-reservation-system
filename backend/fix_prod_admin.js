require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const env = require('./src/config/environment');

mongoose.connect(env.mongoUri)
  .then(async () => {
    try {
      console.log('Connected to Atlas DB for fixing admin');
      const deleted = await User.deleteOne({ email: 'admin@reservetable.com' });
      console.log('Deleted old admin:', deleted.deletedCount);
    } catch (e) {
      console.log('Failed:', e.message);
    }
    process.exit(0);
  });
