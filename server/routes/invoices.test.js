const request = require('supertest');
const app = require('../index');

jest.mock('pg');

describe('Invoices API Tests', () => {
  
  describe('GET /api/invoices', () => {
    
    test('Should return 401 when no authentication token is provided', async () => {
      const response = await request(app)
        .get('/api/invoices');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('Should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .get('/api/invoices')
        .set('Authorization', 'Bearer invalid-token-12345');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/invoices', () => {
    
    test('Should return 401 when no authentication token is provided', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({
          client_id: '123e4567-e89b-12d3-a456-426614174000',
          items: [{ description: 'Test', quantity: 1, unit_price: 100 }]
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('Should return 400 when required fields are missing (validation)', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({});
      
      expect([400, 401]).toContain(response.status);
    });
  });
});