// server/controllers/auth.unit.test.js

// Mock BEFORE importing
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../db', () => ({
  query: jest.fn(),
}));

const { register, login } = require('./auth');
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Controller - Unit Tests', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = { body: {} };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('register', () => {
    test('should return 400 if name is missing', async () => {
      req.body = { email: 'test@test.com', password: '123456' };
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 if email is missing', async () => {
      req.body = { name: 'Test User', password: '123456' };
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 if password is missing', async () => {
      req.body = { name: 'Test User', email: 'test@test.com' };
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 if email already exists', async () => {
      req.body = { name: 'Test', email: 'exists@test.com', password: '123456' };
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already registered' });
    });

    test('should create user and return 201 with token', async () => {
      req.body = { name: 'New User', email: 'new@test.com', password: 'password123' };
      pool.query.mockResolvedValueOnce({ rows: [] });
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'New User', email: 'new@test.com' }] });
      bcrypt.hash.mockResolvedValue('hashed');
      jwt.sign.mockReturnValue('fake-token');
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'fake-token' }));
    });

    test('should return 500 on database error', async () => {
      req.body = { name: 'Test', email: 'test@test.com', password: '123456' };
      pool.query.mockRejectedValue(new Error('DB error'));
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('login', () => {
    test('should return 400 if email missing', async () => {
      req.body = { password: '123456' };
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 if password missing', async () => {
      req.body = { email: 'test@test.com' };
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 if user not found', async () => {
      req.body = { email: 'no@test.com', password: '123456' };
      pool.query.mockResolvedValue({ rows: [] });
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 if password incorrect', async () => {
      req.body = { email: 'user@test.com', password: 'wrong' };
      pool.query.mockResolvedValue({ rows: [{ id: 1, password_hash: 'hash' }] });
      bcrypt.compare.mockResolvedValue(false);
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return token on success (Express defaults to 200)', async () => {
      req.body = { email: 'user@test.com', password: 'correct' };
      const mockUser = { id: 1, name: 'User', email: 'user@test.com', business_name: 'Biz' };
      
      pool.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fake-token');
      
      await login(req, res);
      
      // Don't check res.status – Express defaults to 200
      // Check that json was called with correct data
      expect(res.json).toHaveBeenCalledWith({
        token: 'fake-token',
        user: {
          id: 1,
          name: 'User',
          email: 'user@test.com',
          business_name: 'Biz',
        },
      });
    });

    test('should return 500 on database error', async () => {
      req.body = { email: 'test@test.com', password: '123456' };
      pool.query.mockRejectedValue(new Error('DB error'));
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});