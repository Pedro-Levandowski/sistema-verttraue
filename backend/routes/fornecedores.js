
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateFornecedor, validateId } = require('../middleware/validation');
const {
  getAllFornecedores,
  getFornecedorById,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
  getProdutosByFornecedor
} = require('../controllers/fornecedoresController');

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para fornecedores
router.get('/', getAllFornecedores);
router.get('/:id', validateId, getFornecedorById);
router.get('/:id/produtos', validateId, getProdutosByFornecedor);
router.post('/', validateFornecedor, createFornecedor);
router.put('/:id', [validateId, ...validateFornecedor.slice(0, -1)], updateFornecedor);
router.delete('/:id', validateId, deleteFornecedor);

module.exports = router;
