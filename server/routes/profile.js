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

// Helper to get authenticated user ID
async function getUserIdFromReq(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  let firebaseUid = null;
  let userEmail = null;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    firebaseUid = payload.user_id || payload.sub;
    userEmail = payload.email;
  } catch (e) {
    return null;
  }
  let users = [];
  if (firebaseUid) {
    const [res] = await db.query('SELECT id FROM users WHERE firebase_uid = ?', [firebaseUid]);
    users = res;
  }
  if (users.length === 0 && userEmail) {
    const [res] = await db.query('SELECT id FROM users WHERE email = ?', [userEmail]);
    users = res;
  }
  return users.length > 0 ? users[0].id : null;
}

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
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
    const userId = await getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, phone, address, city, district } = req.body;

    await db.query(
      `UPDATE users SET 
        name = COALESCE(?, name), 
        phone = COALESCE(?, phone), 
        address = COALESCE(?, address), 
        city = COALESCE(?, city), 
        district = COALESCE(?, district)
       WHERE id = ?`,
      [name, phone, address, city, district, userId]
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
    const userId = await getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!req.file) {
      return res.status(400).json({ message: 'No photo provided' });
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const photoUrl = `data:${req.file.mimetype};base64,${b64}`;
    
    await db.query(
      `UPDATE users SET profile_photo = ? WHERE id = ?`,
      [photoUrl, userId]
    );

    res.json({ message: 'Photo updated', photoUrl });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
