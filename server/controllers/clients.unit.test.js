jest.mock('../db', () => ({
    query: jest.fn(),
  }));
  
  const { getClients, createClient, updateClient, deleteClient } = require('./clients');
  const pool = require('../db');
  
  describe('Clients Controller - Unit Tests', () => {
    let req;
    let res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      
      req = {
        body: {},
        params: {},
        user: { id: 1 },
      };
      
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });
  
    describe('getClients', () => {
      test('should return all clients for the authenticated user', async () => {
        const mockClients = [
          { id: 1, user_id: 1, name: 'Client A', email: 'a@test.com', created_at: new Date() },
          { id: 2, user_id: 1, name: 'Client B', email: 'b@test.com', created_at: new Date() },
        ];
        
        pool.query.mockResolvedValue({ rows: mockClients });
        
        await getClients(req, res);
        
        expect(pool.query).toHaveBeenCalledWith(
          'SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC',
          [1]
        );
        expect(res.json).toHaveBeenCalledWith(mockClients);
      });
  
      test('should return empty array when user has no clients', async () => {
        pool.query.mockResolvedValue({ rows: [] });
        
        await getClients(req, res);
        
        expect(res.json).toHaveBeenCalledWith([]);
      });
  
      test('should return 500 on database error', async () => {
        pool.query.mockRejectedValue(new Error('Database connection failed'));
        
        await getClients(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
      });
    });
  
    describe('createClient', () => {
      test('should return 400 if name is missing', async () => {
        req.body = { email: 'test@test.com', phone: '123456', address: '123 St' };
        
        await createClient(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Client name is required' });
        expect(pool.query).not.toHaveBeenCalled();
      });
  
      test('should create client and return 201 with client data', async () => {
        const mockClient = {
          id: 1,
          user_id: 1,
          name: 'New Client',
          email: 'client@test.com',
          phone: '123456789',
          address: '123 Main St',
        };
        
        req.body = {
          name: 'New Client',
          email: 'client@test.com',
          phone: '123456789',
          address: '123 Main St',
        };
        
        pool.query.mockResolvedValue({ rows: [mockClient] });
        
        await createClient(req, res);
        
        expect(pool.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO clients'),
          [1, 'New Client', 'client@test.com', '123456789', '123 Main St']
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockClient);
      });
  
      test('should create client without optional fields', async () => {
        const mockClient = { id: 1, user_id: 1, name: 'Minimal Client' };
        
        req.body = { name: 'Minimal Client' };
        
        pool.query.mockResolvedValue({ rows: [mockClient] });
        
        await createClient(req, res);
        
        expect(pool.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO clients'),
          [1, 'Minimal Client', undefined, undefined, undefined]
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockClient);
      });
  
      test('should return 500 on database error', async () => {
        req.body = { name: 'Test Client' };
        pool.query.mockRejectedValue(new Error('Database error'));
        
        await createClient(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
      });
    });
  
    describe('updateClient', () => {
      test('should return 404 if client not found', async () => {
        req.params = { id: 999 };
        req.body = { name: 'Updated Name' };
        
        pool.query.mockResolvedValue({ rows: [] });
        
        await updateClient(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Client not found' });
      });
  
      test('should update client and return updated data', async () => {
        const updatedClient = {
          id: 1,
          user_id: 1,
          name: 'Updated Name',
          email: 'updated@test.com',
          phone: '987654321',
          address: '456 New St',
        };
        
        req.params = { id: 1 };
        req.body = {
          name: 'Updated Name',
          email: 'updated@test.com',
          phone: '987654321',
          address: '456 New St',
        };
        
        pool.query.mockResolvedValue({ rows: [updatedClient] });
        
        await updateClient(req, res);
        
        expect(pool.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE clients'),
          ['Updated Name', 'updated@test.com', '987654321', '456 New St', 1, 1]
        );
        expect(res.json).toHaveBeenCalledWith(updatedClient);
      });
  
      test('should return 500 on database error', async () => {
        req.params = { id: 1 };
        req.body = { name: 'Test' };
        pool.query.mockRejectedValue(new Error('Database error'));
        
        await updateClient(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
      });
    });
  
    describe('deleteClient', () => {
      test('should return 404 if client not found', async () => {
        req.params = { id: 999 };
        
        pool.query.mockResolvedValue({ rows: [] });
        
        await deleteClient(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Client not found' });
      });
  
      test('should delete client and return success message', async () => {
        req.params = { id: 1 };
        
        pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
        
        await deleteClient(req, res);
        
        expect(pool.query).toHaveBeenCalledWith(
          'DELETE FROM clients WHERE id=$1 AND user_id=$2 RETURNING *',
          [1, 1]
        );
        expect(res.json).toHaveBeenCalledWith({ message: 'Client deleted successfully' });
      });
  
      test('should return 500 on database error', async () => {
        req.params = { id: 1 };
        pool.query.mockRejectedValue(new Error('Database error'));
        
        await deleteClient(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
      });
    });
  });