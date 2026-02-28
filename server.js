import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './utils/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';

// Initialization
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Essential for parsing the phone/otp body

// Request Logger (Helpful for debugging mobile connections)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// --- REGISTER AUTH ROUTES ---
// This makes your endpoints: /api/auth/request-otp and /api/auth/verify-otp
app.use('/api/auth', authRoutes);

// Base Hello API
app.get('/api/hello', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is live and routes are registered!",
  });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});