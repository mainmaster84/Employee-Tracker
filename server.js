const mysql = require('mysql2');
const inquirer = require('inquirer');

// Connect to database
const connection = mysql.createConnection({
  host: 'localhost',
  // Your MySQL username,
  user: '',
  // Your MySQL password
  password: '',
  database: 'tracker'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected to the database")
});