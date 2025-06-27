
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateConjunto, validateId } = require('../middleware/validation');
const {
  getAllConjuntos,
  getConjuntoById,
  createConjunto,
  updateConjunto,
  deleteConjunto
} = require('../controllers/conjuntosController');

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para conjuntos
router.get('/', getAllConjuntos);
router.get('/:id', validateId, getConjuntoById);
router.post('/', validateConjunto, createConjunto);
router.put('/:id', [validateId, ...validateConjunto.slice(0, -1)], updateConjunto);
router.delete('/:id', validateId, deleteConjunto);

module.exports = router;
