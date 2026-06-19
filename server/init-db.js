const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDb() {
  try {
    // Connect without database selected
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'nirmal',
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
