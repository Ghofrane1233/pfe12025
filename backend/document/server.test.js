const request = require('supertest');
const app = require('./server');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const TEST_TOKEN = jwt.sign({ id: 1 }, JWT_SECRET);
const TEST_PORT = 5007; // Port différent de votre autre test

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

  // Création d'un part_model pour les tests
  try {
    await dbConnection.execute(`
      INSERT INTO parts_models (id, reference, name) 
      VALUES (?, ?, ?)`, 
      [1, 'TEST-HW-001', 'Test Hardware Model']
    );
  } catch (err) {
    if (!err.message.includes('Duplicate entry')) {
      console.log('❌ Erreur création part_model:', err.message);
    }
  }
});

afterAll(async () => {
  try {
    // Nettoyage de la base de données
    await dbConnection.execute('DELETE FROM part_model_hardware WHERE part_model_id = 1');
    await dbConnection.execute('DELETE FROM parts_models WHERE id = 1');
    await dbConnection.end();
    await new Promise(resolve => server.close(resolve));
  } catch (err) {
    console.error("❌ Erreur dans afterAll:", err);
  }
});

describe('Tests API Documents Techniques', () => {
  it('POST /technical-documents devrait créer un document technique', async () => {
    const testData = {
      part_model_id: 1,
      file_name: 'test-doc-' + Date.now() + '.pdf',
      file_type: 'application/pdf',
      file_path: '/uploads/test-doc.pdf'
    };

    const res = await request(`http://localhost:${TEST_PORT}`)
      .post('/technical-documents')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .send(testData);

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it('GET /technical-documents devrait retourner des documents', async () => {
    const res = await request(`http://localhost:${TEST_PORT}`)
      .get('/technical-documents')
      .set('Authorization', `Bearer ${TEST_TOKEN}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /technical-documents/count devrait retourner le nombre de documents', async () => {
    const res = await request(`http://localhost:${TEST_PORT}`)
      .get('/technical-documents/count')
      .set('Authorization', `Bearer ${TEST_TOKEN}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBeDefined();
  });

  it('PUT /technical-documents/:id devrait mettre à jour un document', async () => {
    // D'abord créer un document
    const createRes = await request(`http://localhost:${TEST_PORT}`)
      .post('/technical-documents')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .send({
        part_model_id: 1,
        file_name: 'to-update.pdf',
        file_type: 'application/pdf',
        file_path: '/uploads/to-update.pdf'
      });

    const docId = createRes.body.id;

    // Puis le mettre à jour
    const updateRes = await request(`http://localhost:${TEST_PORT}`)
      .put(`/technical-documents/${docId}`)
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .send({
        part_model_id: 1,
        file_name: 'updated.pdf',
        file_type: 'application/pdf',
        file_path: '/uploads/updated.pdf'
      });

    expect(updateRes.statusCode).toBe(200);
  });

  it('DELETE /technical-documents/:id devrait supprimer un document', async () => {
    // D'abord créer un document
    const createRes = await request(`http://localhost:${TEST_PORT}`)
      .post('/technical-documents')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .send({
        part_model_id: 1,
        file_name: 'to-delete.pdf',
        file_type: 'application/pdf',
        file_path: '/uploads/to-delete.pdf'
      });

    const docId = createRes.body.id;

    // Puis le supprimer
    const deleteRes = await request(`http://localhost:${TEST_PORT}`)
      .delete(`/technical-documents/${docId}`)
      .set('Authorization', `Bearer ${TEST_TOKEN}`);

    expect(deleteRes.statusCode).toBe(200);
  });

  it('POST /upload-file devrait accepter les fichiers', async () => {
    const filePath = path.join(__dirname, 'test-file.tmp');
    fs.writeFileSync(filePath, 'test content');

    const res = await request(`http://localhost:${TEST_PORT}`)
      .post('/upload-file')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .attach('file', filePath);

    expect(res.statusCode).toBe(200);
    expect(res.body.filePath).toBeDefined();

    fs.unlinkSync(filePath);
  });

  it('devrait retourner 401 sans token JWT valide', async () => {
    const res = await request(`http://localhost:${TEST_PORT}`)
      .get('/technical-documents');
    
    expect(res.statusCode).toBe(401);
  });
});