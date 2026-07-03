const axios = require('axios');

async function run() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

    // 1. Login
    const loginRes = await api.post('/auth/login', {
      email: 'admin@reservetable.com',
      password: 'Admin@123'
    });
    const token = loginRes.data.data.token;
    console.log("Logged in");
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 2. Create Reservation for right now
    const now = new Date();
    const startTime = new Date(now.getTime() - 10 * 60 * 1000); // started 10 mins ago
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // ends in 1 hour

    const res = await api.post('/reservations', {
      guestCount: 2,
      reservationDate: startTime.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      notes: 'test flow'
    });
    console.log("Created reservation ID:", res.data.data.reservation._id, "Status:", res.data.data.reservation.reservationStatus);

    // 3. Fetch from Admin API
    const adminRes = await api.get('/admin/reservations');
    const all = adminRes.data.data.reservations;
    const mine = all.find(r => r._id === res.data.data.reservation._id);
    console.log("Fetched reservation status:", mine ? mine.reservationStatus : 'NOT FOUND');

  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
run();
