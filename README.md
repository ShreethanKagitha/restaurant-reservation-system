# ReserveTable - Restaurant Reservation System

**ReserveTable** is a modern, responsive, and secure Restaurant Reservation Management System. It was built as a full-stack application to seamlessly handle dynamic table availability, secure authentication, and role-based access control for both Customers and Administrators.

---

## 🌟 Key Features

### 1. Ultra-Premium Frontend (React + Vite + Tailwind v4)
- **Glassmorphism UI**: A beautifully designed, highly responsive interface with custom micro-animations and a floating navigation capsule.
- **State Management**: Robust state handling utilizing `React Hook Form` for forms and custom Context providers for global authentication state.

### 2. Secure Authentication (JWT + 2FA)
- **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for `CUSTOMER` and `ADMIN` roles.
- **Two-Factor Authentication (2FA)**: Built a secondary security layer requiring a 6-digit OTP code to complete sign-in. *(Note: OTP codes are securely logged to the backend console for local testing purposes).*

### 3. Dynamic Allocation Engine (Node.js + Express)
- **Conflict Prevention**: Uses a transactional Mongoose allocation algorithm to strictly prevent double-bookings based on operating hours, capacity, and active timeslots.
- **Table Management**: Admins can securely view live table occupancies, monitor daily timelines, and reassign tables easily.

---

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Tailwind CSS v4, React Router, React Hook Form, Lucide Icons.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs.
- **Architecture:** Clean Architecture principles (Controllers -> Services -> Repositories).

---

## 🚀 Live Demo & Testing

### Live Links
- **Frontend (Vercel):** *[Insert your Vercel Link here]*
- **Backend (Render):** *[Insert your Render Link here]*

### Test Credentials
To evaluate the platform quickly, you can use the following pre-configured test accounts:

**Admin Access:**
- **Email:** `admin@reservetable.com` *(Replace with your actual admin email)*
- **Password:** `admin123` *(Replace with your actual admin password)*

**Customer Access:**
- **Email:** `guest@example.com` *(Replace with your actual customer email)*
- **Password:** `password123` *(Replace with your actual customer password)*

> **Note on 2FA Testing:** When logging in, the system will prompt for a 6-digit OTP. If testing locally or via Render, check the backend server logs to view the generated OTP.

---

## 💻 Local Development Setup

To run this project locally, ensure you have **Node.js (v18+)** and a **MongoDB** connection string.

### 1. Install Dependencies
This project uses a root-level script to install dependencies for both the frontend and backend simultaneously:
```bash
npm run install:all
```

### 2. Environment Configuration
Copy the `.env.example` file to `.env` in the root directory and update your connection strings:
```bash
cp .env.example .env
```
Ensure you provide a valid `MONGO_URI` and `JWT_SECRET`.

### 3. Start the Development Servers
Run the following command to boot both the React frontend and Express backend concurrently:
```bash
npm run dev
```
- The frontend will be available at: `http://localhost:5173`
- The backend API will be available at: `http://localhost:5000`

---

## 📄 License
This project was created as an internship assignment and is open-source.
