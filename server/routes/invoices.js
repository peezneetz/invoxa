const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { invoiceRules, statusRules } = require('../middleware/rules');
const { getInvoices, getInvoice, createInvoice, updateStatus, deleteInvoice } = require('../controllers/invoices');

router.get('/', auth, getInvoices);
router.get('/:id', auth, getInvoice);
router.post('/', auth, invoiceRules, validate, createInvoice);
router.patch('/:id/status', auth, statusRules, validate, updateStatus);
router.delete('/:id', auth, deleteInvoice);

module.exports = router;
