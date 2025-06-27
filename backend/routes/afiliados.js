
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateAfiliado, validateId } = require('../middleware/validation');
const {
  getAllAfiliados,
  getAfiliadoById,
  createAfiliado,
  updateAfiliado,
  deleteAfiliado,
  getEstoqueAfiliado
} = require('../controllers/afiliadosController');

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para afiliados
router.get('/', getAllAfiliados);
router.get('/:id', validateId, getAfiliadoById);
router.get('/:id/estoque', validateId, getEstoqueAfiliado);
router.post('/', validateAfiliado, createAfiliado);
router.put('/:id', [validateId, ...validateAfiliado.slice(0, -1)], updateAfiliado);
router.delete('/:id', validateId, deleteAfiliado);

module.exports = router;
