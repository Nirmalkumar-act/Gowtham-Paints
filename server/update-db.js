require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'nirmal',
      database: process.env.DB_NAME || 'gowtham_paints',
      port: process.env.DB_PORT || 3306,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    console.log(`Connected to MySQL (${process.env.DB_NAME || 'gowtham_paints'}). Creating gallery_images table...`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gallery_item_id INT NOT NULL,
        image_url LONGTEXT NOT NULL,
        FOREIGN KEY (gallery_item_id) REFERENCES gallery_items(id) ON DELETE CASCADE
      )
    `);

    console.log('Table gallery_images created successfully!');
    await connection.end();
  } catch (err) {
    console.error('Failed to update database:', err);
  }
}

updateDb();
