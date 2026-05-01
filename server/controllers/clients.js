const pool = require('../db');

const getClients = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get clients error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createClient = async (req, res) => {
  const { name, email, phone, address } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Client name is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO clients (user_id, name, email, phone, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, name, email, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  try {
    const result = await pool.query(
      `UPDATE clients SET name=$1, email=$2, phone=$3, address=$4
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [name, email, phone, address, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM clients WHERE id=$1 AND user_id=$2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getClients, createClient, updateClient, deleteClient };
