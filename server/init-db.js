require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      multipleStatements: true
    });

    console.log('Connected to MySQL. Executing schema.sql...');

    // Read schema file
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    // Execute schema
    await connection.query(schemaSql);
    console.log('Database and tables initialized successfully!');

    await connection.end();
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

initDb();
