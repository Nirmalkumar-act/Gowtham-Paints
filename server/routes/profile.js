/* ============================================
   Profile Routes - Gowtham Paints
   ============================================ */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Photo upload config
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users ORDER BY updated_at DESC LIMIT 1');
    if (users.length > 0) {
      const { firebase_uid, ...profile } = users[0];
      return res.json({ profile });
    }
    res.json({ profile: null });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile
router.put('/', async (req, res) => {
  try {
    const { name, phone, address, city, district } = req.body;

    await db.query(
      `UPDATE users SET 
        name = COALESCE(?, name), 
        phone = COALESCE(?, phone), 
        address = COALESCE(?, address), 
        city = COALESCE(?, city), 
        district = COALESCE(?, district)
       WHERE id = (SELECT id FROM (SELECT id FROM users ORDER BY updated_at DESC LIMIT 1) as t)`,
      [name, phone, address, city, district]
    );

    res.json({ message: 'Profile updated' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/profile/photo
router.post('/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo provided' });
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const photoUrl = `data:${req.file.mimetype};base64,${b64}`;
    
    await db.query(
      `UPDATE users SET profile_photo = ? 
       WHERE id = (SELECT id FROM (SELECT id FROM users ORDER BY updated_at DESC LIMIT 1) as t)`,
      [photoUrl]
    );

    res.json({ message: 'Photo updated', photoUrl });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
