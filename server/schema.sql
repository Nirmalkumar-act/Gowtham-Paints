-- ============================================
-- GOWTHAM PAINTS - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS gowtham_paints;
USE gowtham_paints;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL DEFAULT 'User',
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  district VARCHAR(100) DEFAULT NULL,
  state VARCHAR(50) DEFAULT 'Tamil Nadu',
  role ENUM('user', 'admin') DEFAULT 'user',
  profile_photo LONGTEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_firebase_uid (firebase_uid),
  INDEX idx_email (email)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(50) DEFAULT 'Tamil Nadu',
  status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  allocated_date DATE DEFAULT NULL,
  admin_notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Gallery items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  image_url LONGTEXT DEFAULT NULL,
  category VARCHAR(50) DEFAULT 'Interior',
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  added_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category (category)
);

-- Ratings & Reviews table
CREATE TABLE IF NOT EXISTS ratings_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gallery_item_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gallery_item_id) REFERENCES gallery_items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_review (gallery_item_id, user_id),
  INDEX idx_gallery_item (gallery_item_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('booking_new', 'booking_confirmed', 'date_allocated', 'general') DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read),
  INDEX idx_created_at (created_at)
);

-- Insert default admin user (password handled by Firebase)
-- Admin email: tamilnk145@gmail.com
INSERT IGNORE INTO users (firebase_uid, name, email, role) 
VALUES ('admin-uid-placeholder', 'Gowtham Admin', 'tamilnk145@gmail.com', 'admin');

-- Insert sample gallery items
INSERT IGNORE INTO gallery_items (id, title, description, category, avg_rating, total_reviews) VALUES
(1, 'Modern Living Room', 'Complete interior painting with premium matte finish. Warm tones that create a welcoming atmosphere.', 'Interior', 4.80, 24),
(2, 'Elegant Bedroom Suite', 'Serene blue and grey tones with accent wall texture. Perfect for a relaxing bedroom ambiance.', 'Interior', 4.90, 18),
(3, 'Villa Exterior', 'Weather-resistant exterior painting with UV protection. Classic white and grey combination.', 'Exterior', 4.70, 31),
(4, 'Textured Feature Wall', 'Designer sand texture finish creating a stunning 3D effect. Modern contemporary style.', 'Texture', 5.00, 15),
(5, 'Apartment Complex', 'Complete exterior painting of 12-unit apartment complex. Durable and long-lasting finish.', 'Exterior', 4.60, 22),
(6, 'Rustic Wood Polish', 'Premium wood polishing for antique furniture and doors. Restoring natural wood grain beauty.', 'Wood Polish', 4.80, 12),
(7, 'Terrace Waterproofing', 'Complete terrace waterproofing with 10-year warranty. No more leaks during monsoon.', 'Waterproofing', 4.90, 28),
(8, 'Kids Room Special', 'Fun and colorful painting with cartoon themes. Making kids rooms vibrant and joyful.', 'Interior', 5.00, 9),
(9, 'Royal Texture Design', 'Luxurious metallic texture painting with gold highlights. Perfect for feature walls and lobbies.', 'Texture', 4.70, 20);
