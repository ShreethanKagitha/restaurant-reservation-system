const mongoose = require('mongoose');
const Reservation = require('./src/models/Reservation');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/restaurant_reservations');

  const tenMinsAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await Reservation.find({ createdAt: { $gte: tenMinsAgo } }).lean();
  
  console.log(`Found ${recent.length} recent reservations:`);
  for (const r of recent) {
    console.log(`ID: ${r._id}, Status: ${r.reservationStatus}, Start: ${r.startTime.toISOString()}, End: ${r.endTime.toISOString()}`);
  }
  
  process.exit(0);
}
run();
