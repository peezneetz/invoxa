const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { clientRules } = require('../middleware/rules');
const { getClients, createClient, updateClient, deleteClient } = require('../controllers/clients');

router.get('/', auth, getClients);
router.post('/', auth, clientRules, validate, createClient);
router.put('/:id', auth, clientRules, validate, updateClient);
router.delete('/:id', auth, deleteClient);

module.exports = router;
