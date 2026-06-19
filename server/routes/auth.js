/* ============================================
   Auth Routes - Gowtham Paints
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Admin email constant
const ADMIN_EMAIL = 'tamilnk145@gmail.com';

// POST /api/auth/sync - Sync Firebase user to MySQL
router.post('/sync', async (req, res) => {
  try {
    const { firebase_uid, name, email, profile_photo } = req.body;

    if (!firebase_uid || !email) {
      return res.status(400).json({ message: 'Firebase UID and email are required' });
    }

    // Determine role - admin email always gets admin role
    const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const role = isAdminEmail ? 'admin' : 'user';

    // Check if user exists by firebase_uid
    const [existingByUid] = await db.query(
      'SELECT id, role FROM users WHERE firebase_uid = ?',
      [firebase_uid]
    );

    if (existingByUid.length > 0) {
      // Update existing user - always enforce correct role for admin
      await db.query(
        'UPDATE users SET name = COALESCE(?, name), email = ?, role = ?, profile_photo = COALESCE(?, profile_photo) WHERE firebase_uid = ?',
        [name, email, role, profile_photo, firebase_uid]
      );
      console.log(`✅ User synced (by uid): ${email} -> role: ${role}`);
      return res.json({ message: 'User synced', userId: existingByUid[0].id, role });
    }

    // Check if user exists by email (e.g., admin with placeholder uid)
    const [existingByEmail] = await db.query(
      'SELECT id, role FROM users WHERE email = ?',
      [email]
    );

    if (existingByEmail.length > 0) {
      // User exists by email but with different firebase_uid - update the uid and role
      await db.query(
        'UPDATE users SET firebase_uid = ?, name = COALESCE(?, name), role = ?, profile_photo = COALESCE(?, profile_photo) WHERE email = ?',
        [firebase_uid, name, role, profile_photo, email]
      );
      console.log(`✅ User synced (by email): ${email} -> role: ${role}`);
      return res.json({ message: 'User synced', userId: existingByEmail[0].id, role });
    }

    // Create new user
    const [result] = await db.query(
      'INSERT INTO users (firebase_uid, name, email, role, profile_photo) VALUES (?, ?, ?, ?, ?)',
      [firebase_uid, name || 'User', email, role, profile_photo || null]
    );

    console.log(`✅ New user created: ${email} -> role: ${role}`);
    res.status(201).json({ message: 'User created', userId: result.insertId, role });
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/role - Get user role
router.get('/role', async (req, res) => {
  try {
    // Extract Firebase token and decode to get user info
    const authHeader = req.headers.authorization;
    let userEmail = null;
    let firebaseUid = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Decode the JWT payload (Firebase tokens are JWTs)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userEmail = payload.email;
        firebaseUid = payload.user_id || payload.sub;
      } catch (e) {
        console.error('Token decode error:', e.message);
      }
    }

    let users = [];

    // First try to find user by firebase_uid, then by email
    if (firebaseUid) {
      const [result] = await db.query('SELECT * FROM users WHERE firebase_uid = ?', [firebaseUid]);
      users = result;
    }

    if (users.length === 0 && userEmail) {
      const [result] = await db.query('SELECT * FROM users WHERE email = ?', [userEmail]);
      users = result;
    }

    if (users.length > 0) {
      const user = users[0];
      return res.json({
        role: user.role,
        profile: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          district: user.district,
          state: user.state,
          profile_photo: user.profile_photo
        }
      });
    }

    res.json({ role: 'user', profile: null });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
