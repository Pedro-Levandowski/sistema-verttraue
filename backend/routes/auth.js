
const express = require('express');
const router = express.Router();
const { initDatabase, login, verify, register, testDatabase, resetAdmin, createUser } = require('../controllers/authController');
const { validateLogin } = require('../middleware/validation');

// Inicializar banco de dados (NOVO - deve ser o primeiro a ser executado)
router.post('/init-database', initDatabase);

// Login de usuário
router.post('/login', validateLogin, login);

// Verificar token
router.get('/verify', verify);

// Registrar usuário
router.post('/register', validateLogin, register);

// Testar conexão com banco de dados
router.get('/test-database', testDatabase);

// Resetar usuário admin
router.post('/reset-admin', resetAdmin);

// Criar usuário (novo endpoint para administração)
router.post('/create-user', validateLogin, createUser);

module.exports = router;
