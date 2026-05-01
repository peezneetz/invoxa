const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getInvoices, getInvoice, createInvoice, updateStatus, deleteInvoice } = require('../controllers/invoices');

router.get('/', auth, getInvoices);
router.get('/:id', auth, getInvoice);
router.post('/', auth, createInvoice);
router.patch('/:id/status', auth, updateStatus);
router.delete('/:id', auth, deleteInvoice);

module.exports = router;
