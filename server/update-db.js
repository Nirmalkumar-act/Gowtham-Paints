const mysql = require('mysql2/promise');

async function updateDb() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'nirmal',
      database: 'gowtham_paints'
    });

    console.log('Connected to MySQL. Creating gallery_images table...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gallery_item_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
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
