
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  updateEstoqueAfiliado,
  getEstoquePorAfiliado,
  getProdutosPorAfiliado
} = require('../controllers/estoqueController');

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para estoque de afiliados
router.put('/afiliado', updateEstoqueAfiliado);
router.get('/afiliado/:afiliado_id', getEstoquePorAfiliado);
router.get('/afiliado/:afiliado_id/produtos', getProdutosPorAfiliado);

module.exports = router;
