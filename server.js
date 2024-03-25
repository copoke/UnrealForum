const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

// Serve static files (CSS, JS, images) from a directory named 'public'
app.use(express.static('public'));

// MySQL database connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'unrealforumdb'
});

// Connect to MySQL database
db.connect((err) => {
  if (err) { throw err; }
  console.log('Connected to the database');
});

app.get('/forum-categories', (req, res) => {
  const sql = `
    SELECT 
      *,
      CreatedDate,
      NOW(),
    FROM posts`;

  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Serve your HTML file for the root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/unreal.html');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});