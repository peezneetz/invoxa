// server/controllers/invoices.unit.test.js

// Mock the database BEFORE importing the controller
jest.mock('../db', () => ({
  query: jest.fn(),
}));

const { 
  getInvoices, 
  createInvoice, 
  getInvoiceById, 
  updateInvoiceStatus, 
  deleteInvoice 
} = require('./invoices');
const pool = require('../db');

describe('Invoices Controller - Unit Tests', () => {
  let req;
  let res;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock request object
    req = {
      body: {},
      params: {},
      user: { id: 1, email: 'test@example.com' },
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Suppress console errors during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================
  // GET INVOICES TESTS
  // ============================================================
  describe('getInvoices', () => {
    test('should return all invoices for the authenticated user', async () => {
      const mockInvoices = [
        { 
          id: 1, 
          user_id: 1, 
          client_id: 1, 
          invoice_number: 'INV-001',
          total: 199.99, 
          status: 'draft' 
        },
        { 
          id: 2, 
          user_id: 1, 
          client_id: 2, 
          invoice_number: 'INV-002',
          total: 299.99, 
          status: 'sent' 
        },
      ];

      pool.query.mockResolvedValue({ rows: mockInvoices });

      await getInvoices(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM invoices WHERE user_id = $1'),
        [1]
      );
      expect(res.json).toHaveBeenCalledWith(mockInvoices);
    });

    test('should return empty array when user has no invoices', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await getInvoices(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('should return 500 on database error', async () => {
      pool.query.mockRejectedValue(new Error('Database connection failed'));

      await getInvoices(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  // ============================================================
  // CREATE INVOICE TESTS
  // ============================================================
  describe('createInvoice', () => {
    const validItems = [
      { description: 'Consulting Services', quantity: 2, unit_price: 150 },
      { description: 'Design Work', quantity: 1, unit_price: 75 },
    ];

    const validBody = {
      client_id: '123e4567-e89b-12d3-a456-426614174000',
      due_date: '2025-12-31',
      currency: 'KES',
      notes: 'Monthly retainer invoice',
      items: validItems,
    };

    test('should return 400 if client_id is missing', async () => {
      req.body = { ...validBody, client_id: undefined };

      await createInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Client ID is required' });
      expect(pool.query).not.toHaveBeenCalled();
    });

    test('should return 400 if items array is empty', async () => {
      req.body = { ...validBody, items: [] };

      await createInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'At least one line item is required' });
    });

    test('should return 400 if item description is missing', async () => {
      req.body = {
        ...validBody,
        items: [{ quantity: 2, unit_price: 150 }],
      };

      await createInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('description') })
      );
    });

    test('should return 400 if item quantity is invalid', async () => {
      req.body = {
        ...validBody,
        items: [{ description: 'Service', quantity: -2, unit_price: 150 }],
      };

      await createInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('quantity') })
      );
    });

    test('should return 400 if item unit_price is invalid', async () => {
      req.body = {
        ...validBody,
        items: [{ description: 'Service', quantity: 2, unit_price: -50 }],
      };

      await createInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('price') })
      );
    });

    test('should create invoice and return 201 with invoice data', async () => {
      const mockInvoice = {
        id: 1,
        user_id: 1,
        client_id: '123e4567-e89b-12d3-a456-426614174000',
        invoice_number: 'INV-2025-001',
        total: 375, // (2 * 150) + (1 * 75)
        status: 'draft',
        due_date: '2025-12-31',
        currency: 'KES',
        notes: 'Monthly retainer invoice',
        created_at: new Date(),
      };

      req.body = validBody;
      pool.query
        .mockResolvedValueOnce({ rows: [mockInvoice] }) // First query - insert invoice
        .mockResolvedValueOnce({ rows: [] }); // Second query - insert items

      await createInvoice(req, res);

      // Check invoice insert query
      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('INSERT INTO invoices'),
        expect.arrayContaining([
          1,
          '123e4567-e89b-12d3-a456-426614174000',
          expect.stringContaining('INV-'), // invoice_number
          'draft',
          '2025-12-31',
          'KES',
          'Monthly retainer invoice',
          375,
        ])
      );

      // Check items insert query
      expect(pool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO invoice_items'),
        expect.arrayContaining([1, 'Consulting Services', 2, 150])
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockInvoice);
    });

    test('should return 500 on database error during invoice creation', async () => {
      req.body = validBody;
      pool.query.mockRejectedValue(new Error('Database error'));

      await createInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  // ============================================================
  // GET INVOICE BY ID TESTS
  // ============================================================
  describe('getInvoiceById', () => {
    test('should return 404 if invoice not found', async () => {
      req.params = { id: '999' };
      pool.query.mockResolvedValue({ rows: [] });

      await getInvoiceById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invoice not found' });
    });

    test('should return invoice with items if found', async () => {
      const mockInvoice = { 
        id: 1, 
        user_id: 1, 
        client_id: 1, 
        total: 199.99,
        status: 'draft'
      };
      
      req.params = { id: '1' };
      pool.query.mockResolvedValue({ rows: [mockInvoice] });

      await getInvoiceById(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM invoices WHERE id = $1 AND user_id = $2'),
        ['1', 1]
      );
      expect(res.json).toHaveBeenCalledWith(mockInvoice);
    });

    test('should return 500 on database error', async () => {
      req.params = { id: '1' };
      pool.query.mockRejectedValue(new Error('Database error'));

      await getInvoiceById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  // ============================================================
  // UPDATE INVOICE STATUS TESTS
  // ============================================================
  describe('updateInvoiceStatus', () => {
    test('should return 400 if status is missing', async () => {
      req.params = { id: '1' };
      req.body = {};

      await updateInvoiceStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Status is required' });
    });

    test('should return 400 if status is invalid', async () => {
      req.params = { id: '1' };
      req.body = { status: 'invalid_status' };

      await updateInvoiceStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid status' });
    });

    test('should return 404 if invoice not found', async () => {
      req.params = { id: '999' };
      req.body = { status: 'sent' };
      pool.query.mockResolvedValue({ rows: [] });

      await updateInvoiceStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invoice not found' });
    });

    test('should update status and return updated invoice', async () => {
      const mockInvoice = { id: 1, user_id: 1, status: 'sent' };
      req.params = { id: '1' };
      req.body = { status: 'sent' };
      pool.query.mockResolvedValue({ rows: [mockInvoice] });

      await updateInvoiceStatus(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE invoices SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *'),
        ['sent', '1', 1]
      );
      expect(res.json).toHaveBeenCalledWith(mockInvoice);
    });

    test('should return 500 on database error', async () => {
      req.params = { id: '1' };
      req.body = { status: 'sent' };
      pool.query.mockRejectedValue(new Error('Database error'));

      await updateInvoiceStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  // ============================================================
  // DELETE INVOICE TESTS
  // ============================================================
  describe('deleteInvoice', () => {
    test('should return 404 if invoice not found', async () => {
      req.params = { id: '999' };
      pool.query.mockResolvedValue({ rows: [] });

      await deleteInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invoice not found' });
    });

    test('should delete invoice and return success message', async () => {
      req.params = { id: '1' };
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await deleteInvoice(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM invoices WHERE id = $1 AND user_id = $2 RETURNING *'),
        ['1', 1]
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'Invoice deleted successfully' });
    });

    test('should return 500 on database error', async () => {
      req.params = { id: '1' };
      pool.query.mockRejectedValue(new Error('Database error'));

      await deleteInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});