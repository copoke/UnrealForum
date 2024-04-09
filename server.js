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
    posts.postId,
    posts.*,
    users.UserId AS CreatorUserId,
    users.Username AS CreatorUsername,
    threads.ThreadId AS RecentThreadId,
    threads.CreatorId AS RecentThreadCreatorId,
    recentThreadCreator.Username AS RecentThreadCreatorUsername,
    posts.CreatedDate AS PostCreatedDate, -- Alias the CreatedDate column from the posts table
    NOW() AS CurrentTime,
    COUNT(DISTINCT threads.ThreadId) AS ThreadCount  -- Count of threads associated with each post
FROM 
    posts
JOIN 
    users ON posts.CreatorId = users.UserId
LEFT JOIN (
    SELECT
        ThreadId,
        CreatorId,
        MAX(CreatedDate) AS MaxCreatedDate
    FROM
        threads
    GROUP BY
        ThreadId
) AS recentThread ON posts.postId = recentThread.ThreadId
LEFT JOIN
    threads ON recentThread.ThreadId = threads.ThreadId
LEFT JOIN
    users AS recentThreadCreator ON recentThread.CreatorId = recentThreadCreator.UserId
GROUP BY
    posts.postId, users.UserId, users.Username, threads.ThreadId, threads.CreatorId, recentThreadCreator.Username, posts.CreatedDate;
  `;

  db.query(sql, (err, result) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
      }

      // Send the result (which includes usernames) to the client
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