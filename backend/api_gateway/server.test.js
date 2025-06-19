const request = require('supertest');
const app = require('./server'); // your main file
const { createProxyMiddleware } = require('http-proxy-middleware');
const nock = require('nock');

describe('API Gateway', () => {
  let server;

  beforeAll(() => {
    server = app.listen(4000); // Start server on test port
  });

  afterAll((done) => {
    server.close(done); // Close server after tests
  });

  describe('Configuration', () => {
    it('should use CORS middleware', () => {
      const corsMiddleware = app._router.stack.find(
        layer => layer.name === 'corsMiddleware'
      );
      expect(corsMiddleware).toBeDefined();
    });

    it('should have environment variables defined', () => {
      expect(process.env.AUTH_SERVICE_URL).toBeDefined();
      expect(process.env.CLIENT_SERVICE_URL).toBeDefined();
      expect(process.env.MODEL_SERVICE_URL).toBeDefined();
      expect(process.env.PARTS_SERVICE_URL).toBeDefined();
      expect(process.env.DOCUMENT_SERVICE_URL).toBeDefined();
      expect(process.env.FIRMWARE_SERVICE_URL).toBeDefined();
    });
  });

  describe('Proxy Routes', () => {
    beforeEach(() => {
      // Mock the environment variables for testing
      process.env.AUTH_SERVICE_URL = 'http://auth-service';
      process.env.CLIENT_SERVICE_URL = 'http://client-service';
      process.env.MODEL_SERVICE_URL = 'http://model-service';
      process.env.PARTS_SERVICE_URL = 'http://parts-service';
      process.env.DOCUMENT_SERVICE_URL = 'http://document-service';
      process.env.FIRMWARE_SERVICE_URL = 'http://firmware-service';
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should proxy /login to auth service', async () => {
      const mockResponse = { token: 'test-token' };
      nock('http://auth-service')
        .get('/login')
        .reply(200, mockResponse);

      const response = await request(app)
        .get('/login')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
    });

    it('should proxy /clients to client service', async () => {
      const mockResponse = [{ id: 1, name: 'Client A' }];
      nock('http://client-service')
        .get('/clients')
        .reply(200, mockResponse);

      const response = await request(app)
        .get('/clients')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
    });

    it('should proxy /model to model service', async () => {
      const mockResponse = { model: 'XYZ' };
      nock('http://model-service')
        .get('/model')
        .reply(200, mockResponse);

      const response = await request(app)
        .get('/model')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
    });

    it('should proxy /parts to parts service', async () => {
      const mockResponse = [{ part: '123', name: 'Component A' }];
      nock('http://parts-service')
        .get('/parts')
        .reply(200, mockResponse);

      const response = await request(app)
        .get('/parts')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
    });

    it('should proxy /technical-documents to document service', async () => {
      const mockResponse = { docs: ['doc1.pdf', 'doc2.pdf'] };
      nock('http://document-service')
        .get('/technical-documents')
        .reply(200, mockResponse);

      const response = await request(app)
        .get('/technical-documents')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
    });

    it('should proxy /firmware to firmware service', async () => {
      const mockResponse = { version: '1.0.0' };
      nock('http://firmware-service')
        .get('/firmware')
        .reply(200, mockResponse);

      const response = await request(app)
        .get('/firmware')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
    });

    it('should return 502 if proxy target is unavailable', async () => {
      nock('http://auth-service')
        .get('/login')
        .reply(500);

      await request(app)
        .get('/login')
        .expect(502);
    });
  });
});