
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateProduto, validateId } = require('../middleware/validation');
const {
  getAllProdutos,
  getProdutoById,
  createProduto,
  updateProduto,
  deleteProduto
} = require('../controllers/produtosController');

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para produtos
router.get('/', getAllProdutos);
router.get('/:id', validateId, getProdutoById);
router.post('/', validateProduto, createProduto);
router.put('/:id', [validateId, ...validateProduto.slice(0, -1)], updateProduto);
router.delete('/:id', validateId, deleteProduto);

module.exports = router;
