
const express = require('express');
const router = express.Router();
const { login, verifyToken, register } = require('../controllers/authController');
const { validateLogin } = require('../middleware/validation');

// Login de usuário
router.post('/login', validateLogin, login);

// Verificar token
router.get('/verify', verifyToken);

// Registrar usuário (apenas para desenvolvimento)
router.post('/register', validateLogin, register);

module.exports = router;
