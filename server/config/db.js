/* ============================================
   Database Configuration - Gowtham Paints
   ============================================ */

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'nirmal',
  database: process.env.DB_NAME || 'gowtham_paints',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.log('📌 Make sure MySQL is running and the database "gowtham_paints" exists.');
    console.log('📌 Run the schema.sql file to create tables.');
  });

module.exports = pool;
