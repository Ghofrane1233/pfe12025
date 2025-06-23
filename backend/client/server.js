require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // version async/await
const cors = require('cors');
const jwt = require('jsonwebtoken');
const client = require('prom-client');
const app = express();
const PORT = process.env.PORT;
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

// Middleware
app.use(cors());
app.use(express.json());
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

// Middleware d'authentification JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {

    if (err) return res.status(403).json({ message: 'Token invalide ou expiré' });
    req.user = user;
    next();
  });
}



// ----------------------
// Routes sécurisées clients
// ----------------------

// 1. Récupérer les clients (avec pagination)
app.get('/clients', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [results] = await pool.execute(
      'SELECT * FROM clients ORDER BY registration_date DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await pool.execute('SELECT COUNT(*) AS total FROM clients');
    const total = countResult[0].total;
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
    console.error('Erreur récupération clients :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 2. Ajouter un client
app.post('/clients', authenticateToken, async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const [results] = await pool.execute(
      'INSERT INTO clients (name, email, phone, address, registration_date) VALUES (?, ?, ?, ?, NOW())',
      [name, email, phone, address]
    );
    res.status(201).json({ message: 'Client ajouté', id: results.insertId });
  } catch (err) {
    console.error('Erreur ajout client :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 3. Modifier un client
app.put('/clients/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  try {
    const [results] = await pool.execute(
      'UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, email, phone, address, id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.json({ message: 'Client modifié avec succès' });
  } catch (err) {
    console.error('Erreur modification client :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 4. Supprimer un client
app.delete('/clients/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await pool.execute(
      'DELETE FROM clients WHERE id = ?',
      [id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.json({ message: 'Client supprimé avec succès' });
  } catch (err) {
    console.error('Erreur suppression client :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 5. Compter les clients
app.get('/clients/count', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute('SELECT COUNT(*) AS total FROM clients');
    res.json({ total: result[0].total });
  } catch (err) {
    console.error('Erreur comptage clients :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Route GitHub webhook
app.post('/github-webhook', (req, res) => {
  console.log("✅ Webhook reçu:", req.body);
  res.status(200).send('OK');
});


// ----------------------
// Lancer le serveur
// ----------------------
  app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
  });
module.exports = app; // export pour les tests
