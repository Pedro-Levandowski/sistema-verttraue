
const express = require('express');
const router = express.Router();
const { initDatabase, login, verify, register, testDatabase, resetAdmin, createUser } = require('../controllers/authController');

// Inicializar banco de dados (NOVO - deve ser o primeiro a ser executado)
router.post('/init-database', initDatabase);

// Login de usuário (SEM middleware validateLogin que não existe)
router.post('/login', login);

// Verificar token
router.get('/verify', verify);

// Registrar usuário (SEM middleware validateLogin que não existe)
router.post('/register', register);

// Testar conexão com banco de dados
router.get('/test-database', testDatabase);

// Resetar usuário admin (SEM validação - é para emergência)
router.post('/reset-admin', resetAdmin);

// Criar usuário (SEM validação validateLogin - vai validar internamente)
router.post('/create-user', createUser);

module.exports = router;
