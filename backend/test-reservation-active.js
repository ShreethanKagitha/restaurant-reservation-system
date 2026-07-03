const mongoose = require('mongoose');
const reservationService = require('./src/services/reservationService');
const tableRepository = require('./src/repositories/tableRepository');
const User = require('./src/models/User');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/restaurant_reservations');

  const user = await User.findOne({ email: 'admin@reservetable.com' });
  
  const now = new Date();
  // start 10 minutes ago, end 50 minutes from now (active right now)
  const startTime = new Date(now.getTime() - 10 * 60 * 1000); 
  const endTime = new Date(now.getTime() + 50 * 60 * 1000); 

  try {
    const { reservation } = await reservationService.createReservation({
      customerId: user._id,
      guestCount: 2,
      reservationDate: startTime,
      startTime,
      endTime,
      notes: "Test active"
    });
    console.log("CREATED RESERVATION STATUS:", reservation.reservationStatus);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
  
  process.exit(0);
}
run();
