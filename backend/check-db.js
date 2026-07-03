const mongoose = require('mongoose');
const Reservation = require('./src/models/Reservation');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/restaurant_reservations');

  const all = await Reservation.find();
  console.log("ALL RESERVATIONS:");
  for (const r of all) {
    console.log(r._id, r.reservationStatus, r.startTime, r.endTime);
  }
  process.exit(0);
}
run();
