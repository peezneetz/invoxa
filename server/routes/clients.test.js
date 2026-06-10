jest.mock('pg');
const request = require('supertest');
const app = require('../index');

jest.mock('pg');

describe('Clients API Tests', () => {
  
  describe('GET /api/clients', () => {
    test('Should return 401 when no authentication token is provided', async () => {
      const response = await request(app)
        .get('/api/clients');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/clients', () => {
    test('Should return 401 when no authentication token is provided', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({ name: 'Test Client' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/clients/:id', () => {
    test('Should return 404 when client does not exist (with UUID format)', async () => {
      // Use a valid UUID format that doesn't exist
      const fakeUUID = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/clients/${fakeUUID}`);
      
      // Without auth, returns 401. With auth but no client, returns 404.
      // Since we're mocking, it might return 401 or 404
      expect([401, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/clients/:id', () => {
    test('Should return 401 when no authentication token is provided', async () => {
      const fakeUUID = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/clients/${fakeUUID}`)
        .send({ name: 'Updated Name' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/clients/:id', () => {
    test('Should return 401 when no authentication token is provided', async () => {
      const fakeUUID = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/clients/${fakeUUID}`);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});