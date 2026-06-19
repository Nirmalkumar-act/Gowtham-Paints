const db = require('./config/db');

async function migrate() {
  try {
    console.log('Migrating database schema for Base64 image storage...');
    await db.query('ALTER TABLE users MODIFY COLUMN profile_photo LONGTEXT DEFAULT NULL');
    console.log('Updated users table.');
    await db.query('ALTER TABLE gallery_items MODIFY COLUMN image_url LONGTEXT DEFAULT NULL');
    console.log('Updated gallery_items table.');
    await db.query('ALTER TABLE gallery_images MODIFY COLUMN image_url LONGTEXT DEFAULT NULL');
    console.log('Updated gallery_images table.');
    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    // gallery_images table might not exist in schema.sql, ignore if it fails
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('gallery_images table does not exist, skipping.');
      process.exit(0);
    } else {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  }
}

migrate();
