# ReserveTable - Restaurant Reservation System

**ReserveTable** is a full-stack Restaurant Reservation System built with the MERN stack (React, Node.js, Express, MongoDB). This platform enables customers to book tables and administrators to manage restaurant operations securely and efficiently.

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Local or Atlas)

### 1. Installation
The repository is structured as a monorepo containing both the frontend and backend. To install all dependencies at once, run the following in the root directory:
```bash
npm run install:all
```

### 2. Environment Configuration
Copy the environment template and configure your credentials:
```bash
cp .env.example .env
```
Ensure you provide a valid `MONGO_URI` and a strong `JWT_SECRET` in the `.env` file.

### 3. Run the Application
Start both the React frontend and the Express backend concurrently:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 📌 Assumptions Made
- **Single Restaurant Context:** The system assumes it is managing reservations for a single restaurant location.
- **Fixed Table Topology:** The restaurant has a predefined, fixed number of tables with specific seating capacities.
- **Operating Hours:** Reservations are restricted to standard operating hours (e.g., 11:00 AM to 11:00 PM).
- **Time Slots:** Reservations have a minimum duration of 30 minutes and a maximum of 4 hours.
- **2FA Environment:** Because no live SMS gateway is attached, Two-Factor Authentication (2FA) OTP codes are assumed to be "sent" by logging them to the backend server console.

---

## 🧠 Reservation and Availability Logic

The core allocation engine prevents overlapping reservations through a strict, atomic database validation process.

1. **Input Validation:** When a customer requests a reservation, the system validates the guest count, date, and time boundaries.
2. **Table Querying:** The system retrieves all `AVAILABLE` tables that possess a seating capacity greater than or equal to the requested guest count.
3. **Sorting (Optimal Fit):** Candidate tables are sorted in ascending order by capacity. This ensures small parties don't unnecessarily occupy large tables.
4. **Conflict Detection:** For the top candidate table, the system queries the database to see if any active, non-cancelled reservations exist where:
   `newStartTime < existingEndTime` AND `newEndTime > existingStartTime`
5. **Atomic Allocation:** If the table is free, a reservation is instantiated. To ensure thread safety in high-traffic scenarios, these queries are bound to a Mongoose transaction session. If the first choice is booked, the algorithm checks the next optimal table until an available one is found or throws a `409 Conflict`.

---

## 🔐 Role-Based Access Control (User vs Admin)

The system utilizes JSON Web Tokens (JWT) mapped to specific roles (`CUSTOMER` and `ADMIN`) to enforce strict authorization constraints at both the UI and API layers.

### Customer (User) Role
- **Access:** Can access the public booking portal and their personal dashboard.
- **Capabilities:** Can create new reservations, view their own reservation history, and cancel their upcoming bookings.
- **Restrictions:** Customers are completely blocked from viewing other users' data or accessing operational metrics.

### Administrator Role
- **Access:** Has exclusive access to the specialized Operations Center interface.
- **Capabilities:** Can view all global reservations across the restaurant, track live table occupancies, filter bookings by specific dates, and override/cancel any user's reservation. Admins also manage the global layout of tables (e.g., setting a table to maintenance mode).

---

## ⚠️ Known Limitations
- **No Real-Time Sockets:** The frontend relies on HTTP polling/refreshing rather than WebSockets (like Socket.io). Therefore, if two users view the availability page simultaneously, one might see a slot that gets booked milliseconds later by the other.
- **SMS Gateway Missing:** 2FA currently outputs the One-Time Password to the server terminal rather than sending a real SMS due to the lack of a paid Twilio integration.
- **Static Table Joining:** The algorithm currently assigns a single table per booking. It does not automatically "join" two smaller tables together to accommodate a massive party.

---

## 🚀 Areas for Improvement with Additional Time
1. **Live Floorplan UI:** I would implement an interactive, drag-and-drop SVG floorplan for the Admin dashboard, allowing staff to visually assign and move guests between physical tables.
2. **Automated Reminders:** Integrating a cron job scheduler alongside Nodemailer/Twilio to automatically send email/SMS reminders to customers 2 hours before their booking to reduce no-shows.
3. **Waitlist Queue System:** If a specific time is fully booked, customers could opt into a waitlist. If an existing reservation is cancelled, the system would automatically ping the first person in the queue.
4. **WebSocket Integration:** Implementing Socket.io so the Operations Center updates instantly when a new booking is created, without the admin needing to refresh the page.
