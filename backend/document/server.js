require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // version async/await
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT ;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware pour vérifier le token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Non autorisé

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token invalide
    req.user = user;
    next();
  });
}

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Serve uploads statiques
app.use('/uploads', express.static(uploadDir));

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: 10
};
const pool = mysql.createPool(dbConfig);
// Routes API sécurisées par JWT
app.get('/technical-documents', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [documents] = await pool.query(
      'SELECT * FROM part_model_hardware ORDER BY uploaded_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [count] = await pool.query('SELECT COUNT(*) AS total FROM part_model_hardware');

    res.json({
      data: documents,
      pagination: {
        total: count[0].total,
        totalPages: Math.ceil(count[0].total / limit),
        currentPage: page,
        limit,
        hasNextPage: page < Math.ceil(count[0].total / limit),
        hasPreviousPage: page > 1
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des documents:', err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

app.post('/technical-documents', authenticateToken, async (req, res) => {
  const { part_model_id, file_name, file_type, file_path } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO part_model_hardware (part_model_id, file_name, file_type, file_path) VALUES (?, ?, ?, ?)',
      [part_model_id, file_name, file_type, file_path]
    );
    res.status(201).json({ message: 'Document ajouté avec succès', id: result.insertId });
  } catch (err) {
    console.error('Erreur lors de l\'ajout:', err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

app.put('/technical-documents/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { part_model_id, file_name, file_type, file_path } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE part_model_hardware SET part_model_id = ?, file_name = ?, file_type = ?, file_path = ? WHERE id = ?',
      [part_model_id, file_name, file_type, file_path, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Document non trouvé' });
    res.json({ message: 'Document mis à jour avec succès' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

app.delete('/technical-documents/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM part_model_hardware WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Document non trouvé' });
    res.json({ message: 'Document supprimé avec succès' });
  } catch (err) {
    console.error('Erreur de suppression:', err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

app.post('/upload-file', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier envoyé' });

  const filePath = `/uploads/${req.file.filename}`;
  res.status(200).json({
    message: 'Fichier envoyé avec succès',
    filePath: filePath,
    fileName: req.file.originalname
  });
});

app.get('/technical-documents/count', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) AS total FROM part_model_hardware');
    res.json({ total: result[0].total });
  } catch (err) {
    console.error('Erreur lors du comptage:', err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur de documents techniques en cours sur http://localhost:${PORT}`);
});

module.exports = app; // export pour les tests
