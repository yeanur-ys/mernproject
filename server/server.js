// Import dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Logging startup information
console.log('Server starting...');
console.log('MONGO_URI:', process.env.MONGO_URI);

// Configure middleware
app.use(cors({
  origin: 'http://localhost:3000',  // Frontend origin
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug configuration for development
mongoose.set('debug', process.env.NODE_ENV !== 'production');

// MongoDB connection with error handling
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit if we can't connect to the database
  });

// API routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/borrows', borrowRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Library API is working!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      books: '/api/books',
      borrows: '/api/borrows'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║ 🚀 Server running on port ${PORT}              ║
║ API: http://localhost:${PORT}                  ║
║ Environment: ${process.env.NODE_ENV || 'development'}                   ║
╚════════════════════════════════════════════╝
  `);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});