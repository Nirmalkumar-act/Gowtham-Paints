const mysql = require('mysql2/promise');

async function fixAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'nirmal',
      database: 'gowtham_paints'
    });

    // Fix admin role
    await connection.query("UPDATE users SET role = 'admin' WHERE email = 'tamilnk145@gmail.com'");
    console.log('✅ Admin role fixed for tamilnk145@gmail.com');

    // Remove old placeholder admin if it exists with different email
    await connection.query("DELETE FROM users WHERE firebase_uid = 'admin-uid-placeholder' AND email != 'tamilnk145@gmail.com'");
    console.log('✅ Cleaned up placeholder admin');

    // Show all users
    const [rows] = await connection.query('SELECT id, firebase_uid, name, email, role FROM users');
    console.log('\nAll users:');
    console.table(rows);

    await connection.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

fixAdmin();
