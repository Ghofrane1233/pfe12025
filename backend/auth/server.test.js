const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./server'); // ou authServer.js selon ton fichier

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

describe('Authentification API', () => {
  test('POST /login with missing fields', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('POST /login with invalid credentials', async () => {
    const res = await request(app).post('/login').send({
      username: 'invalide',
      password: 'fakepass',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Identifiants invalides');
  });

  test('GET /dashboard without token should return 401', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.statusCode).toBe(401);
  });

  test('GET /dashboard with invalid token should return 403', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', 'Bearer faketoken');
    expect(res.statusCode).toBe(403);
  });

  test('GET /dashboard with valid token should return user', async () => {
    const token = jwt.sign({ userId: 1, username: 'test' }, JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('utilisateur');
  });
});
