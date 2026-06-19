/* ============================================
   Gallery Routes - Gowtham Paints
   ============================================ */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Configure multer for image uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/gallery - List gallery items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM gallery_items';
    const params = [];

    if (category && category !== 'All') {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const [items] = await db.query(query, params);
    res.json({ items });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/gallery/:id - Get gallery item detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await db.query('SELECT * FROM gallery_items WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Get reviews
    const [reviews] = await db.query(
      `SELECT r.*, u.name as user_name 
       FROM ratings_reviews r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.gallery_item_id = ? 
       ORDER BY r.created_at DESC`,
      [id]
    );

    // Get additional images
    const [images] = await db.query(
      'SELECT image_url FROM gallery_images WHERE gallery_item_id = ?',
      [id]
    );
    const imageUrls = images.map(img => img.image_url);
    if (items[0].image_url) {
      imageUrls.unshift(items[0].image_url); // add cover image to the front
    }

    res.json({
      item: {
        ...items[0],
        reviews,
        images: imageUrls
      }
    });
  } catch (error) {
    console.error('Get gallery item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/gallery - Add gallery item (admin)
router.post('/', upload.array('images', 20), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    let coverImageUrl = null;
    const additionalImages = [];

    if (req.files && req.files.length > 0) {
      const coverFile = req.files[0];
      const coverB64 = Buffer.from(coverFile.buffer).toString('base64');
      coverImageUrl = `data:${coverFile.mimetype};base64,${coverB64}`;
      for (let i = 1; i < req.files.length; i++) {
        const file = req.files[i];
        const additionalB64 = Buffer.from(file.buffer).toString('base64');
        additionalImages.push(`data:${file.mimetype};base64,${additionalB64}`);
      }
    }

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const [result] = await db.query(
      'INSERT INTO gallery_items (title, description, image_url, category) VALUES (?, ?, ?, ?)',
      [title, description || '', coverImageUrl, category || 'Interior']
    );

    const newItemId = result.insertId;

    if (additionalImages.length > 0) {
      const values = additionalImages.map(url => [newItemId, url]);
      await db.query('INSERT INTO gallery_images (gallery_item_id, image_url) VALUES ?', [values]);
    }

    res.status(201).json({
      message: 'Gallery item added',
      id: newItemId,
      imageUrl: coverImageUrl
    });
  } catch (error) {
    console.error('Add gallery item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/gallery/:id/images - Add more images to gallery item
router.post('/:id/images', upload.array('images', 5), async (req, res) => {
  try {
    // For now, update the main image
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const b64 = Buffer.from(file.buffer).toString('base64');
      const imageUrl = `data:${file.mimetype};base64,${b64}`;
      await db.query('UPDATE gallery_items SET image_url = ? WHERE id = ?', [imageUrl, req.params.id]);
    }
    res.json({ message: 'Images added' });
  } catch (error) {
    console.error('Add images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/gallery/:id/review - Add review
router.post('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review_text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Extract user from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    let firebaseUid = null;
    let userEmail = null;
    
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      firebaseUid = payload.user_id || payload.sub;
      userEmail = payload.email;
    } catch (e) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find actual user ID in database
    let users = [];
    if (firebaseUid) {
      const [result] = await db.query('SELECT id FROM users WHERE firebase_uid = ?', [firebaseUid]);
      users = result;
    }
    if (users.length === 0 && userEmail) {
      const [result] = await db.query('SELECT id FROM users WHERE email = ?', [userEmail]);
      users = result;
    }

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    const userId = users[0].id;

    await db.query(
      'INSERT INTO ratings_reviews (gallery_item_id, user_id, rating, review_text) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?, review_text = ?',
      [id, userId, rating, review_text || '', rating, review_text || '']
    );

    // Update average rating
    const [stats] = await db.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM ratings_reviews WHERE gallery_item_id = ?',
      [id]
    );

    await db.query(
      'UPDATE gallery_items SET avg_rating = ?, total_reviews = ? WHERE id = ?',
      [stats[0].avg_rating || 0, stats[0].total || 0, id]
    );

    res.json({ message: 'Review added' });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/gallery/:id - Delete gallery item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM gallery_items WHERE id = ?', [id]);
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
