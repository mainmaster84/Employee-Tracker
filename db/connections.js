const mysql = require('mysql2');

// Connect to database
const db = mysql.createConnection({
  host: 'localhost',
  // Your MySQL username,
  user: '',
  // Your MySQL password
  password: '',
  database: 'election'
});

module.exports = db;