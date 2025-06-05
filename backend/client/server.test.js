require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');

let server;

beforeAll(() => {
  // Charger le serveur et s'assurer qu'il est prêt
  server = require('./server');
});

afterAll((done) => {
  // Fermer le serveur proprement après les tests
  if (server && server.close) {
    server.close(done);
  } else {
    done();
  }
});

describe('GET /clients without token', () => {
  it('should return 401 if token is missing', async () => {
    const res = await request(server).get('/clients');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Token manquant');
  });
});

describe('GET /clients with valid token', () => {
  it('should return clients with pagination', async () => {
    // Vérifie d'abord si le secret est bien défini
    expect(process.env.JWT_SECRET).toBeDefined();

    const testToken = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET);

    const res = await request(server)
      .get('/clients?page=1&limit=2')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
  });
});
