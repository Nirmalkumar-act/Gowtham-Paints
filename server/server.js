/* ============================================
   GOWTHAM PAINTS - Express Server
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Allow exact FRONTEND_URL match
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // Allow ALL vercel.app domains (including preview deployments)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const galleryRoutes = require('./routes/gallery');
const notificationRoutes = require('./routes/notifications');
const profileRoutes = require('./routes/profile');

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gowtham Paints API is running 🎨' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🎨 Gowtham Paints API Server        ║
  ║   Running on http://localhost:${PORT}     ║
  ║   Ready to paint the world! 🌍        ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = app;
