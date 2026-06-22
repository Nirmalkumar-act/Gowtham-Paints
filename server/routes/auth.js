/* ============================================
   Auth Routes - Gowtham Paints
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Admin emails
const ADMIN_EMAILS = process.env.ADMIN_EMAIL 
  ? process.env.ADMIN_EMAIL.split(',').map(e => e.trim().toLowerCase()) 
  : ['tamilnk145@gmail.com', 'gowthanajith@gmail.com'];

// POST /api/auth/sync - Sync Firebase user to MySQL
router.post('/sync', async (req, res) => {
  try {
    const { firebase_uid, name, email, profile_photo } = req.body;

    if (!firebase_uid || !email) {
      return res.status(400).json({ message: 'Firebase UID and email are required' });
    }

    // Determine role - admin emails get admin role
    const isAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase());
    const role = isAdminEmail ? 'admin' : 'user';

    // Check if user exists by firebase_uid
    const [existingByUid] = await db.query(
      'SELECT id, role FROM users WHERE firebase_uid = ?',
      [firebase_uid]
    );

    let userRecord = null;

    if (existingByUid.length > 0) {
      // Update existing user - always enforce correct role for admin
      await db.query(
        'UPDATE users SET name = COALESCE(?, name), email = ?, role = ?, profile_photo = COALESCE(?, profile_photo) WHERE firebase_uid = ?',
        [name, email, role, profile_photo, firebase_uid]
      );
      const [updated] = await db.query('SELECT * FROM users WHERE firebase_uid = ?', [firebase_uid]);
      userRecord = updated[0];
      console.log(`✅ User synced (by uid): ${email} -> role: ${role}`);
    } else {
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
        const [updated] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        userRecord = updated[0];
        console.log(`✅ User synced (by email): ${email} -> role: ${role}`);
      } else {
        // Create new user
        const [result] = await db.query(
          'INSERT INTO users (firebase_uid, name, email, role, profile_photo) VALUES (?, ?, ?, ?, ?)',
          [firebase_uid, name || 'User', email, role, profile_photo || null]
        );
        const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        userRecord = newUser[0];
        console.log(`✅ New user created: ${email} -> role: ${role}`);
      }
    }

    const profile = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      phone: userRecord.phone,
      address: userRecord.address,
      city: userRecord.city,
      district: userRecord.district,
      state: userRecord.state,
      profile_photo: userRecord.profile_photo
    };

    res.status(existingByUid.length > 0 ? 200 : 201).json({
      message: 'User synced',
      userId: userRecord.id,
      role: userRecord.role,
      profile
    });
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
        // Decode the JWT payload (Firebase tokens are JWTs - Base64URL encoded)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
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
