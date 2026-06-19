const mysql = require('mysql2/promise');

async function clearGallery() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'nirmal',
      database: 'gowtham_paints'
    });

    console.log('Connected to MySQL. Clearing gallery_items table...');

    await connection.query('DELETE FROM gallery_items');

    console.log('Table gallery_items cleared successfully!');
    await connection.end();
  } catch (err) {
    console.error('Failed to clear database:', err);
  }
}

clearGallery();
