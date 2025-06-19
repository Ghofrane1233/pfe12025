require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT ;
const JWT_SECRET = process.env.JWT_SECRET;

const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Exemple de métriques personnalisées
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestCounter);
// Middleware global
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
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


// 🔐 Middleware pour vérifier le JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // format: "Bearer token"

  if (!token) return res.status(401).json({ message: 'Token manquant' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalide' });
    req.user = user;
    next();
  });
}

// Routes protégées par JWT

// 📄 GET all parts (paginated)
app.get('/parts', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(`
      SELECT parts.*, 
             clients.name AS client_name,
             CONCAT(parts_models.brand, ' ', parts_models.model, ' (', parts_models.reference, ')') AS model_reference
      FROM parts
      LEFT JOIN clients ON parts.client_id = clients.id
      LEFT JOIN parts_models ON parts.model_id = parts_models.id
      ORDER BY added_date DESC
      LIMIT ? OFFSET ?`, [limit, offset]);

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM parts`);

    res.json({
      data: rows,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (err) {
    console.error('Erreur GET /parts:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ➕ POST add part
app.post('/parts', authenticateToken, async (req, res) => {
  const { number, model_id, client_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO parts (number, model_id, client_id) VALUES (?, ?, ?)',
      [number, model_id, client_id]
    );
    res.status(201).json({ message: 'Pièce ajoutée', id: result.insertId });
  } catch (err) {
    console.error('Erreur POST /parts:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✏️ PUT update part
app.put('/parts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { number, model_id, client_id } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE parts SET number = ?, model_id = ?, client_id = ? WHERE id = ?',
      [number, model_id, client_id, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Pièce non trouvée' });
    res.json({ message: 'Pièce mise à jour' });
  } catch (err) {
    console.error('Erreur PUT /parts:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

//  DELETE part
app.delete('/parts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM parts WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Pièce non trouvée' });
    res.json({ message: 'Pièce supprimée' });
  } catch (err) {
    console.error('Erreur DELETE /parts:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 🔢 Count parts
app.get('/parts/count', authenticateToken, async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM parts');
    res.json({ total });
  } catch (err) {
    console.error('Erreur COUNT /parts:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});



//  Lancement
app.listen(PORT, () => {
  console.log(` Microservice Parts lancé : http://localhost:${PORT}`);
});

module.exports = app; // export pour les tests
