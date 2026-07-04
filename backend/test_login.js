const mongoose = require('mongoose');
const authService = require('./src/services/authService');

mongoose.connect('mongodb://localhost:27017/restaurant_reservations')
  .then(async () => {
    try {
      const res = await authService.loginUser({ email: 'admin@reservetable.com', password: 'Admin@123' });
      console.log('Login successful. Token:', res.token.substring(0, 20) + '...');
    } catch (e) {
      console.log('Login failed:', e.message);
    }
    process.exit(0);
  });
