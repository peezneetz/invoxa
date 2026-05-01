const pool = require('../db');

const getInvoices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, c.name as client_name 
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.user_id = $1 
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get invoices error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await pool.query(
      `SELECT i.*, c.name as client_name, c.email as client_email, c.address as client_address
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.id = $1 AND i.user_id = $2`,
      [id, req.user.id]
    );

    if (invoice.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const items = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1',
      [id]
    );

    res.json({ ...invoice.rows[0], items: items.rows });
  } catch (err) {
    console.error('Get invoice error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createInvoice = async (req, res) => {
  const { client_id, due_date, currency, notes, items } = req.body;

  if (!client_id || !items || items.length === 0) {
    return res.status(400).json({ error: 'Client and at least one item are required' });
  }

  try {
    const count = await pool.query(
      'SELECT COUNT(*) FROM invoices WHERE user_id = $1',
      [req.user.id]
    );
    const invoice_number = `INV-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;

    const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

    const invoiceResult = await pool.query(
      `INSERT INTO invoices (user_id, client_id, invoice_number, due_date, currency, notes, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, client_id, invoice_number, due_date, currency || 'KES', notes, total]
    );

    const invoice = invoiceResult.rows[0];

    for (const item of items) {
      await pool.query(
        `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [invoice.id, item.description, item.quantity, item.unit_price]
      );
    }

    const fullItems = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1',
      [invoice.id]
    );

    res.status(201).json({ ...invoice, items: fullItems.rows });
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['draft', 'sent', 'paid', 'overdue'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      'UPDATE invoices SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
      [status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM invoices WHERE id=$1 AND user_id=$2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    console.error('Delete invoice error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getInvoices, getInvoice, createInvoice, updateStatus, deleteInvoice };
