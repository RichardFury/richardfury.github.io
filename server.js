import express from 'express';
import mysql from 'mysql2';

const app = express();
const port = 3000;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'gallery_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/gallery', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM gallery_images');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blogs', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM blogs');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/blogs', async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const [result] = await pool.promise().query(
      'INSERT INTO blogs (title, content, category, tags) VALUES (?, ?, ?, ?)',
      [title, content, category, tags]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});