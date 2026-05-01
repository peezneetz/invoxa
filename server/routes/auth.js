const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth');
const validate = require('../middleware/validate');
const { registerRules, loginRules } = require('../middleware/rules');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

module.exports = router;
