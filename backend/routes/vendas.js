
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateVenda, validateId, validatePeriodo } = require('../middleware/validation');
const {
  getAllVendas,
  getVendaById,
  createVenda,
  updateVenda,
  deleteVenda,
  getVendasPorPeriodo
} = require('../controllers/vendasController');

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para vendas
router.get('/', getAllVendas);
router.get('/periodo', validatePeriodo, getVendasPorPeriodo);
router.get('/:id', validateId, getVendaById);
router.post('/', validateVenda, createVenda);
router.put('/:id', [validateId, validateVenda], updateVenda);
router.delete('/:id', validateId, deleteVenda);

module.exports = router;
