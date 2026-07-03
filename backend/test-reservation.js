const mongoose = require('mongoose');
const reservationService = require('./src/services/reservationService');
const tableRepository = require('./src/repositories/tableRepository');
const User = require('./src/models/User');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/restaurant_reservations', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const user = await User.findOne({ email: 'admin@reservetable.com' });
  const tables = await tableRepository.find();
  if (tables.length === 0) {
    console.log("No tables found.");
    process.exit(1);
  }

  const now = new Date();
  const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

  try {
    const { reservation } = await reservationService.createReservation({
      customerId: user._id,
      guestCount: 2,
      reservationDate: startTime,
      startTime,
      endTime,
      notes: "Test"
    });
    console.log("CREATED RESERVATION STATUS:", reservation.reservationStatus);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
  
  process.exit(0);
}

run();
