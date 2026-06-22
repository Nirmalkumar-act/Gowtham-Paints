/* ============================================
   Notification Routes - Gowtham Paints
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

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

// GET /api/notifications - Get user notifications
router.get('/', async (req, res) => {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Get notifications for authenticated user
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await db.query('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE AND user_id = ?', [userId]);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
