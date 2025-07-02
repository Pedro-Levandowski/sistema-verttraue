
const express = require('express');
const router = express.Router();
const { initDatabase, login, verify, register, testDatabase, resetAdmin, createUser } = require('../controllers/authController');

// Inicializar banco de dados
router.post('/init-database', initDatabase);

// Login de usuário
router.post('/login', login);

// Verificar token
router.get('/verify', verify);

// Registrar usuário
router.post('/register', register);

// Testar conexão com banco de dados
router.get('/test-database', testDatabase);

// Resetar usuário admin
router.post('/reset-admin', resetAdmin);

// Criar usuário
router.post('/create-user', createUser);

module.exports = router;
