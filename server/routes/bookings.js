/* ============================================
   Booking Routes - Gowtham Paints
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address, city, district, state } = req.body;

    // Validation
    if (!name || !phone || !email || !address || !city || !district) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!/^\d{10}$/.test(phone.replace(/\s|-/g, ''))) {
      return res.status(400).json({ message: 'Phone must be 10 digits' });
    }

    const [result] = await db.query(
      `INSERT INTO bookings (customer_name, phone, email, address, city, district, state, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [name, phone, email, address, city, district, state || 'Tamil Nadu']
    );

    // Create notification for admin
    try {
      const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
      for (const admin of admins) {
        await db.query(
          `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'booking_new')`,
          [admin.id, 'New Booking!', `New booking from ${name} in ${city}, ${district}. Phone: ${phone}`]
        );
      }
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.insertId
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings - Get bookings
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM bookings';
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(customer_name LIKE ? OR phone LIKE ? OR email LIKE ? OR city LIKE ? OR district LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [bookings] = await db.query(query, params);
    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/my - Get user's bookings by email
router.get('/my', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const [bookings] = await db.query('SELECT * FROM bookings WHERE email = ? ORDER BY created_at DESC', [email]);
    res.json({ bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, allocated_date, admin_notes } = req.body;

    const updates = [];
    const params = [];

    if (status) { updates.push('status = ?'); params.push(status); }
    if (allocated_date !== undefined) { updates.push('allocated_date = ?'); params.push(allocated_date); }
    if (admin_notes !== undefined) { updates.push('admin_notes = ?'); params.push(admin_notes); }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    params.push(id);
    await db.query(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`, params);

    // If date allocated, notify customer
    if (allocated_date || status === 'confirmed') {
      try {
        const [booking] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
        if (booking.length > 0) {
          const [users] = await db.query('SELECT id FROM users WHERE email = ?', [booking[0].email]);
          if (users.length > 0) {
            const dateStr = allocated_date ? new Date(allocated_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'soon';
            await db.query(
              `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'date_allocated')`,
              [users[0].id, 'Booking Update! 🎉', `Your booking has been ${status || 'updated'}. Scheduled for: ${dateStr}`]
            );
          }
        }
      } catch (notifErr) {
        console.error('Notification error:', notifErr);
      }
    }

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM bookings WHERE id = ?', [id]);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
