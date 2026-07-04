require('dotenv').config();
const mongoose = require('mongoose');
const authService = require('./src/services/authService');
const env = require('./src/config/environment');

mongoose.connect(env.mongoUri)
  .then(async () => {
    try {
      console.log('Connected to Atlas DB');
      
      const res = await authService.loginUser({ email: 'admin@reservetable.com', password: 'Admin@123' });
      console.log('Login successful on deployed backend database!');
      console.log('JWT Generated:', res.token ? 'Yes' : 'No');
      console.log('Role:', res.user.role);
      
    } catch (e) {
      console.log('Login failed:', e.message);
    }
    process.exit(0);
  });
