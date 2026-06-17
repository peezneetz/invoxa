jest.mock('pg');
const request = require('supertest');
const app = require('../index');

describe('Authentication API Tests', () => {
  
  describe('POST /api/auth/register', () => {
    
    test('Should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', password: '123456' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('Should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@example.com' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('Should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: '123456' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('Should return 400 when email is invalid format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'not-an-email', password: '123456' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('Should return 400 when password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: '123' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    
    test('Should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: '123456' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('Should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('Should return 401 when credentials are invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrongpassword' });
      
      expect([400, 401]).toContain(response.status);
    });
  });
});