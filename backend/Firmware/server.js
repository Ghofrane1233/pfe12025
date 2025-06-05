require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT ;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use('/uploads', express.static(uploadDir));

// DB Config
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);
// Middleware JWT (optionnel, à utiliser si les routes sont protégées)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
// GET avec pagination
app.get('/Firmware', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [results] = await pool.query(
      'SELECT * FROM part_model_firmware ORDER BY uploaded_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM part_model_firmware');

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: results,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching firmware:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST firmware
app.post('/Firmware', authenticateToken,async (req, res) => {
  try {
    const { part_model_id, version, description, file_path } = req.body;
    const [result] = await pool.query(
      'INSERT INTO part_model_firmware (part_model_id, version, description, file_path) VALUES (?, ?, ?, ?)',
      [part_model_id, version, description, file_path]
    );
    res.status(201).json({ message: 'Firmware added successfully', id: result.insertId });
  } catch (err) {
    console.error('Error adding firmware:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT firmware
app.put('/Firmware/:id',authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { part_model_id, version, description, file_path } = req.body;
    const [result] = await pool.query(
      'UPDATE part_model_firmware SET part_model_id = ?, version = ?, description = ?, file_path = ? WHERE id = ?',
      [part_model_id, version, description, file_path, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Firmware not found' });
    res.json({ message: 'Firmware updated successfully' });
  } catch (err) {
    console.error('Error updating firmware:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE firmware
app.delete('/Firmware/:id', authenticateToken,async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'DELETE FROM part_model_firmware WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Firmware not found' });
    res.json({ message: 'Firmware deleted successfully' });
  } catch (err) {
    console.error('Error deleting firmware:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload
app.post('/upload-file', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const filePath = `/uploads/${req.file.filename}`;
  res.status(200).json({ message: 'File uploaded successfully', filePath, fileName: req.file.originalname });
});

// Count firmware
app.get('/Firmware/count', authenticateToken,async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM part_model_firmware');
    res.json({ total });
  } catch (err) {
    console.error('Error counting firmware:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Firmware management server running on http://localhost:${PORT}`);
});

module.exports = app; // export pour les tests