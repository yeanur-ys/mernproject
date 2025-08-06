const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const portfinder = require('portfinder');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Body parsing middleware (JSON format)

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/books', bookRoutes); // Book routes

// Catch-all route for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Automatically find an available port and start the server
portfinder.getPort({ port: process.env.PORT || 5000 }, (err, port) => {
  if (err) {
    console.error('Error finding an available port:', err);
    return;
  }
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
