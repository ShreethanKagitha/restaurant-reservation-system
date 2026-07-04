# ReserveTable - Restaurant Reservation System

**ReserveTable** is a modern, full-stack Restaurant Reservation System built as an internship assignment. It features dynamic table management, strict role-based access control (Admin vs. Customer), and secure Two-Factor Authentication.

## 🚀 Live Demo
- **Frontend (Vercel):** *[Insert Vercel Link here]*
- **Backend (Render):** *[Insert Render Link here]*

### Test Credentials
- **Admin:** `admin@reservetable.com` | `admin123`
- **Customer:** `guest@example.com` | `password123`

*(Note: During 2FA login, the 6-digit OTP is output to the backend server logs for easy testing).*

## 🌟 Core Features
1. **Ultra-Premium UI:** Glassmorphism design with React, Tailwind CSS v4, and micro-animations.
2. **Robust Security:** JWT-based sessions, bcrypt password hashing, and a custom 2FA flow.
3. **Smart Allocation:** Transactional Node.js/Mongoose algorithm strictly prevents overlapping reservations.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS v4, React Hook Form
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT

## 💻 Local Setup
1. Clone the repository and install all dependencies:
   ```bash
   npm run install:all
   ```
2. Copy `.env.example` to `.env` and add your MongoDB connection string.
3. Start the frontend and backend concurrently:
   ```bash
   npm run dev
   ```
