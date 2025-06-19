const request = require('supertest');
const app = require('./server');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const TEST_TOKEN = jwt.sign({ id: 1 }, JWT_SECRET);
const TEST_PORT = 5006;

let server;
let dbConnection;

beforeAll(async () => {
  server = app.listen(TEST_PORT);

  // Connexion à la base de données
  dbConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  // Création d’un part_model avec les champs requis
  try {
    await dbConnection.execute(`
      INSERT INTO parts_models (id, reference, name) 
      VALUES (?, ?, ?)`, 
      [1, 'TEST-REF-001', 'Test Model']
    );
  } catch (err) {
    if (!err.message.includes('Duplicate entry')) {
      console.log('❌ Erreur création part_model:', err.message);
    }
  }
});

afterAll(async () => {
  try {
    await dbConnection.execute('DELETE FROM part_model_firmware WHERE part_model_id = 1');
    await dbConnection.execute('DELETE FROM parts_models WHERE id = 1');
    await dbConnection.end();
    await new Promise(resolve => server.close(resolve));
  } catch (err) {
    console.error("❌ Erreur dans afterAll:", err);
  }
});

describe('Tests API Firmware', () => {
  it('POST /Firmware devrait créer un firmware', async () => {
    const testData = {
      part_model_id: 1,
      version: '1.0.0-test-' + Date.now(),
      description: 'Test firmware',
      file_path: '/uploads/test.bin'
    };

    const res = await request(`http://localhost:${TEST_PORT}`)
      .post('/Firmware')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .send(testData);

    if (res.statusCode === 500) {
      console.warn('⚠️ Erreur de contrainte, vérifiez que parts_models.id=1 existe et que tous les champs sont fournis.');
    }

    expect(res.statusCode).toBe(201);
  });

  it('GET /Firmware devrait retourner des données', async () => {
    const res = await request(`http://localhost:${TEST_PORT}`)
      .get('/Firmware')
      .set('Authorization', `Bearer ${TEST_TOKEN}`);
    
    expect(res.statusCode).toBe(200);
  });

  it('POST /upload-file devrait accepter les fichiers', async () => {
    const filePath = path.join(__dirname, 'test-file.tmp');
    fs.writeFileSync(filePath, 'test content');

    const res = await request(`http://localhost:${TEST_PORT}`)
      .post('/upload-file')
      .attach('file', filePath);

    expect(res.statusCode).toBe(200);

    fs.unlinkSync(filePath);
  });
});
