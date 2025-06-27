
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateKit, validateId } = require('../middleware/validation');
const {
  getAllKits,
  getKitById,
  createKit,
  updateKit,
  deleteKit
} = require('../controllers/kitsController');

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para kits
router.get('/', getAllKits);
router.get('/:id', validateId, getKitById);
router.post('/', validateKit, createKit);
router.put('/:id', [validateId, ...validateKit.slice(0, -1)], updateKit);
router.delete('/:id', validateId, deleteKit);

module.exports = router;
