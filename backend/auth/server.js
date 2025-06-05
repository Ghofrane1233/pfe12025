require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

// Fonction pour interroger la base de données
async function interrogerDB(sql, params) {
  let connexion;
  try {
    connexion = await pool.getConnection();
    const [résultats] = await connexion.execute(sql, params);
    return résultats;
  } finally {
    if (connexion) connexion.release();
  }
}

// Route de connexion
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        succès: false, 
        message: 'Nom d\'utilisateur et mot de passe requis' 
      });
    }

    const utilisateurs = await interrogerDB(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username]
    );

    if (utilisateurs.length === 0 || utilisateurs[0].password !== password) {
      return res.status(401).json({ 
        succès: false, 
        message: 'Identifiants invalides' 
      });
    }

    const utilisateur = utilisateurs[0];

    const token = jwt.sign(
      { userId: utilisateur.id, username: utilisateur.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      succès: true,
      message: 'Connexion réussie',
      token,
      utilisateur: { id: utilisateur.id, username: utilisateur.username }
    });

  } catch (erreur) {
    console.error('Erreur lors de la connexion :', erreur);
    res.status(500).json({ 
      succès: false, 
      message: 'Erreur interne du serveur' 
    });
  }
});

// Middleware d'authentification
function authentifierToken(req, res, next) {
  const enTêteAuth = req.headers['authorization'];
  const token = enTêteAuth?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      succès: false, 
      message: 'Token d\'authentification requis' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, décodé) => {
    if (err) {
      console.error('Erreur de vérification JWT :', err);
      return res.status(403).json({ 
        succès: false, 
        message: 'Token invalide ou expiré' 
      });
    }

    req.utilisateur = décodé;
    next();
  });
}

// Route protégée
app.get('/dashboard', authentifierToken, (req, res) => {
  res.json({
    succès: true,
    message: 'Données du tableau de bord',
    utilisateur: req.utilisateur
  });
});

// Démarrer le serveur
app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log('Connexion à la base de données établie');
  } catch (erreur) {
    console.error('Échec de la connexion à la base de données :', erreur);
    process.exit(1);
  }
});

module.exports = app; // Or whatever your Express instance is named
