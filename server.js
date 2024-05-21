const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Serve static files (CSS, JS, images) from a directory named 'public'
app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL database connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'unrealforumdb'
});

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Connect to MySQL database
db.connect((err) => {
  if (err) { throw err; }
  console.log('Connected to the database');
});

app.get('/thread/:id', (req, res) => {
  const threadId = req.params.id;
  const sql = `
    SELECT 
        threads.ThreadId,
        threads.Title AS ThreadTitle,
        threads.Content AS ThreadContent,
        threads.CreatedDate AS ThreadCreatedDate,
        threads.Likes AS ThreadLikes,
        threads.Views AS ThreadViews,
        users.Username AS ThreadCreatorUsername,
        IFNULL((SELECT COUNT(*) FROM comments WHERE comments.ThreadId = threads.ThreadId), 0) AS CommentCount
    FROM 
        threads
    JOIN 
        users ON threads.CreatorId = users.UserId
    WHERE 
        threads.ThreadId = ?;
  `;

  db.query(sql, [threadId], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json(result[0]); // Send the first result (should only be one thread)
  });
});

const isAuthenticated = (req, res, next) => {
  console.log(req.session.userId)
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/login.html');
  }
};


app.post('/signup', (req, res) => {
  const { username, password, email } = req.body;

  const hash = bcrypt.hashSync(password, 10);

  const sql = 'INSERT INTO users (Username, Password, Email, Userrole) VALUES (?, ?, ?, ?)';

  const userrole = 'Regular';

  db.query(sql, [username, hash, email, userrole], (err) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          res.status(500).json({ success: false, message: 'Internal server error' });
          return;
      }

      res.json({ success: true });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE Username = ?';

  db.query(sql, [username], (err, results) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          res.status(500).json({ success: false, message: 'Internal server error' });
          return;
      }

      if (results.length === 0) {
          res.json({ success: false, message: 'Invalid username or password' });
          return;
      }
      const user = results[0];

      if (bcrypt.compareSync(password, user.Password)) {
          req.session.userId = user.UserID;
          res.json({ success: true });
      } else {
          res.json({ success: false, message: 'Invalid username or password' });
      }
  });
});


app.get('/comments/:threadId', (req, res) => {
  const threadId = req.params.threadId;
  const sql = `
    SELECT 
        comments.CommentId,
        comments.Content AS CommentContent,
        comments.Likes AS CommentLikes,
        comments.CreatedDate AS CommentCreatedDate,
        users.Username AS CommentCreatorUsername
    FROM 
        comments
    JOIN 
        users ON comments.CreatorId = users.UserId
    WHERE 
        comments.ThreadId = ?;
  `;

  db.query(sql, [threadId], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json(result);
  });
});

app.get('/forum-categories', (req, res) => {
  const sql = `
  SELECT 
      p.postId,
      p.Title,
      p.Replies,
      p.CreatedDate,
      p.CreatorId,
      u.Username AS CreatorUsername,
      (SELECT COUNT(*) FROM threads WHERE categoryId = p.postId) AS ThreadCount
    FROM
      posts p
    LEFT JOIN
      users u ON p.CreatorID = u.UserID`;
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send('Error fetching categories');
    } else {
      res.json(result);
    }
  });
});

app.get('/threads/:categoryId', (req, res) => {
  const categoryId = req.params.categoryId;
  console.log(categoryId)
  const sql = `
  SELECT 
  threads.ThreadId,
  threads.Title AS ThreadTitle,
  threads.Content AS ThreadContent,
  threads.CreatedDate AS ThreadCreatedDate,
  threads.Likes AS ThreadLikes,
  threads.Views AS ThreadViews,
  (SELECT COUNT(*)
   FROM comments
   WHERE comments.ThreadId = threads.ThreadId) AS CommentCount
FROM 
  threads
WHERE 
  threads.CategoryId = ?;  -- Replace 0 with the desired CategoryId;
  `;

  db.query(sql, [categoryId], (err, results) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
      }

      res.json(results); // Send the array of threads
  });
});

app.post('/increment-views/:id', (req, res) => {
  const threadId = req.params.id;
  const sql = `UPDATE threads SET Views = Views + 1 WHERE ThreadId = ?`;

  db.query(sql, [threadId], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json({ success: true });
  });
});

app.get('/thread-details', (req, res) => {
  res.sendFile(__dirname + '/public/thread-details.html');
});

// Endpoint to create a new post
app.post('/post', isAuthenticated, (req, res) => {
  const { title, content } = req.body;
  const creatorId = req.session.userId;

  const sql = 'INSERT INTO posts (Title, Content, CreatorId) VALUES (?, ?, ?)';

  db.query(sql, [title, content, creatorId], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json({ success: true, postId: result.insertId });
  });
});

// Endpoint to create a new thread
app.post('/thread', isAuthenticated, (req, res) => {
  const { title, content, categoryId } = req.body;
  const creatorId = req.session.userId;

  const sql = 'INSERT INTO threads (Title, Content, CreatorId, CategoryId) VALUES (?, ?, ?, ?)';

  db.query(sql, [title, content, creatorId, categoryId], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json({ success: true, threadId: result.insertId });
  });
});

// Serve your HTML file for the root route
app.get('/', isAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/public/unreal.html');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});