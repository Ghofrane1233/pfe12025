const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./server'); // ou le chemin réel de ton fichier

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// Génère un token valide pour le test
const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '1h' });

describe('Microservice Parts - Tests', () => {
  test('GET /parts/count with valid token should return total', async () => {
    const res = await request(app)
      .get('/parts/count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(typeof res.body.total).toBe('number');
  });

  test('GET /parts/count without token should return 401', async () => {
    const res = await request(app).get('/parts/count');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Token manquant');
  });
});
