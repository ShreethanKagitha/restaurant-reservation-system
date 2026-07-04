const mongoose = require('mongoose');
const env = require('./src/config/environment');

async function check() {
  await mongoose.connect(env.mongoUri);
  const tables = await mongoose.connection.db.collection('tables').find({}).toArray();
  console.log('Total tables:', tables.length);
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('Total users:', users.length);
  const reservations = await mongoose.connection.db.collection('reservations').find({}).toArray();
  console.log('Total raw reservations:', reservations.length);
  process.exit(0);
}
check().catch(console.error);
