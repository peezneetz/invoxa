jest.mock('../db', () => ({
  query: jest.fn(),
}));

const { getInvoices, getInvoice, createInvoice, updateStatus, deleteInvoice } = require('./invoices');
const pool = require('../db');

describe('Invoices Controller - Unit Tests', () => {
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

  describe('getInvoices', () => {
    test('should return all invoices for the authenticated user', async () => {
      const mockInvoices = [
        { id: 1, user_id: 1, client_id: 1, total: 199.99, status: 'draft', client_name: 'Client A' },
        { id: 2, user_id: 1, client_id: 2, total: 299.99, status: 'sent', client_name: 'Client B' },
      ];

      pool.query.mockResolvedValue({ rows: mockInvoices });

      await getInvoices(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
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
      pool.query.mockRejectedValue(new Error('Database error'));

      await getInvoices(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getInvoice', () => {
    test('should return 404 if invoice not found', async () => {
      req.params = { id: 999 };
      pool.query.mockResolvedValue({ rows: [] });

      await getInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invoice not found' });
    });

    test('should return invoice with items if found', async () => {
      const mockInvoice = {
        id: 1,
        user_id: 1,
        client_id: 1,
        total: 199.99,
        status: 'draft',
        client_name: 'Client A',
        client_email: 'client@test.com',
        client_address: '123 Test St',
      };

      const mockItems = [
        { id: 1, invoice_id: 1, description: 'Consulting', quantity: 2, unit_price: 100 },
        { id: 2, invoice_id: 1, description: 'Design', quantity: 1, unit_price: 50 },
      ];

      req.params = { id: 1 };
      
      pool.query.mockResolvedValueOnce({ rows: [mockInvoice] });
      pool.query.mockResolvedValueOnce({ rows: mockItems });

      await getInvoice(req, res);

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        [1, 1]
      );

      expect(pool.query).toHaveBeenNthCalledWith(
        2,
        'SELECT * FROM invoice_items WHERE invoice_id = $1',
        [1]
      );

      expect(res.json).toHaveBeenCalledWith({
        ...mockInvoice,
        items: mockItems,
      });
    });

    test('should return 500 on database error', async () => {
      req.params = { id: 1 };
      pool.query.mockRejectedValue(new Error('Database error'));

      await getInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('createInvoice', () => {
    const validItems = [
      { description: 'Consulting', quantity: 2, unit_price: 100 },
      { description: 'Design', quantity: 1, unit_price: 50 },
    ];

    const validBody = {
      client_id: '123e4567-e89b-12d3-a456-426614174000',
      due_date: '2025-12-31',
      currency: 'KES',
      notes: 'Test invoice',
      items: validItems,
    };

    test('should return 400 if client_id is missing', async () => {
      req.body = { ...validBody, client_id: undefined };

      await createInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Client and at least one item are required' });
      expect(pool.query).not.toHaveBeenCalled();
    });

    test('should return 400 if items array is empty', async () => {
      req.body = { ...validBody, items: [] };

      await createInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Client and at least one item are required' });
    });

    test('should create invoice and return 201 with invoice data', async () => {
      const mockInvoice = {
        id: 1,
        user_id: 1,
        client_id: '123e4567-e89b-12d3-a456-426614174000',
        total: 250,
        status: 'draft',
        due_date: '2025-12-31',
        currency: 'KES',
        notes: 'Test invoice',
        invoice_number: 'INV-0001',
      };

      const mockItems = [
        { id: 1, invoice_id: 1, description: 'Consulting', quantity: 2, unit_price: 100 },
        { id: 2, invoice_id: 1, description: 'Design', quantity: 1, unit_price: 50 },
      ];

      req.body = validBody;
      
      pool.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });
      pool.query.mockResolvedValueOnce({ rows: [mockInvoice] });
      pool.query.mockResolvedValueOnce({ rows: [] });
      pool.query.mockResolvedValueOnce({ rows: [] });
      pool.query.mockResolvedValueOnce({ rows: mockItems });

      await createInvoice(req, res);

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        'SELECT COUNT(*) FROM invoices WHERE user_id = $1',
        [1]
      );

      expect(pool.query).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        expect.arrayContaining([
          1,
          '123e4567-e89b-12d3-a456-426614174000',
          expect.stringContaining('INV-'),
          '2025-12-31',
          'KES',
          'Test invoice',
          250,
        ])
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ...mockInvoice,
        items: mockItems,
      });
    });

    test('should return 500 on database error during invoice creation', async () => {
      req.body = validBody;
      pool.query.mockRejectedValue(new Error('Database error'));

      await createInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('updateStatus', () => {
    test('should return 400 if status is missing', async () => {
      req.params = { id: 1 };
      req.body = {};

      await updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid status' });
    });

    test('should return 400 if status is invalid', async () => {
      req.params = { id: 1 };
      req.body = { status: 'invalid_status' };

      await updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid status' });
    });

    test('should return 404 if invoice not found', async () => {
      req.params = { id: 999 };
      req.body = { status: 'sent' };
      pool.query.mockResolvedValue({ rows: [] });

      await updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invoice not found' });
    });

    test('should update status and return updated invoice', async () => {
      const mockInvoice = { id: 1, user_id: 1, status: 'sent' };
      req.params = { id: 1 };
      req.body = { status: 'sent' };
      pool.query.mockResolvedValue({ rows: [mockInvoice] });

      await updateStatus(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE invoices SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
        ['sent', 1, 1]
      );
      expect(res.json).toHaveBeenCalledWith(mockInvoice);
    });

    test('should return 500 on database error', async () => {
      req.params = { id: 1 };
      req.body = { status: 'sent' };
      pool.query.mockRejectedValue(new Error('Database error'));

      await updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('deleteInvoice', () => {
    test('should return 404 if invoice not found', async () => {
      req.params = { id: 999 };
      pool.query.mockResolvedValue({ rows: [] });

      await deleteInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invoice not found' });
    });

    test('should delete invoice and return success message', async () => {
      req.params = { id: 1 };
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await deleteInvoice(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM invoices WHERE id=$1 AND user_id=$2 RETURNING *',
        [1, 1]
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'Invoice deleted successfully' });
    });

    test('should return 500 on database error', async () => {
      req.params = { id: 1 };
      pool.query.mockRejectedValue(new Error('Database error'));

      await deleteInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});