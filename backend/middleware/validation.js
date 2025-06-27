
const { body, param, query, validationResult } = require('express-validator');

// Middleware para processar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Erros de validação:', errors.array());
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

// Validações para produtos
const validateProduto = [
  body('id').notEmpty().withMessage('ID é obrigatório'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('estoque_fisico').optional().isInt({ min: 0 }).withMessage('Estoque físico deve ser um número não negativo'),
  body('estoque_site').optional().isInt({ min: 0 }).withMessage('Estoque site deve ser um número não negativo'),
  body('preco').optional().isFloat({ min: 0 }).withMessage('Preço deve ser um número não negativo'),
  body('preco_compra').optional().isFloat({ min: 0 }).withMessage('Preço de compra deve ser um número não negativo'),
  handleValidationErrors
];

// Validações para fornecedores
const validateFornecedor = [
  body('id').notEmpty().withMessage('ID é obrigatório'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('cidade').optional().isString().withMessage('Cidade deve ser uma string'),
  body('contato').optional().isString().withMessage('Contato deve ser uma string'),
  handleValidationErrors
];

// Validações para afiliados
const validateAfiliado = [
  body('id').notEmpty().withMessage('ID é obrigatório'),
  body('nome_completo').notEmpty().withMessage('Nome completo é obrigatório'),
  body('email').isEmail().withMessage('Email deve ser válido'),
  body('telefone').optional().isString().withMessage('Telefone deve ser uma string'),
  body('comissao').optional().isFloat({ min: 0, max: 100 }).withMessage('Comissão deve ser entre 0 e 100'),
  body('tipo_chave_pix').optional().isIn(['aleatoria', 'cpf', 'telefone', 'email']).withMessage('Tipo de chave PIX inválido'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser true ou false'),
  handleValidationErrors
];

// Validações para vendas
const validateVenda = [
  body('id').notEmpty().withMessage('ID é obrigatório'),
  body('produtos').isArray({ min: 1 }).withMessage('Deve ter pelo menos um produto'),
  body('produtos.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
  body('produtos.*.preco_unitario').optional().isFloat({ min: 0 }).withMessage('Preço unitário deve ser não negativo'),
  body('valor_total').optional().isFloat({ min: 0 }).withMessage('Valor total deve ser não negativo'),
  body('tipo_venda').optional().isIn(['online', 'fisica']).withMessage('Tipo de venda deve ser online ou fisica'),
  handleValidationErrors
];

// Validações para conjuntos
const validateConjunto = [
  body('id').notEmpty().withMessage('ID é obrigatório'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('preco').optional().isFloat({ min: 0 }).withMessage('Preço deve ser não negativo'),
  body('produtos').isArray({ min: 1 }).withMessage('Deve ter pelo menos um produto'),
  body('produtos.*.produto_id').notEmpty().withMessage('ID do produto é obrigatório'),
  body('produtos.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
  handleValidationErrors
];

// Validações para kits
const validateKit = [
  body('id').notEmpty().withMessage('ID é obrigatório'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('preco').optional().isFloat({ min: 0 }).withMessage('Preço deve ser não negativo'),
  body('produtos').isArray({ min: 1 }).withMessage('Deve ter pelo menos um produto'),
  body('produtos.*.produto_id').notEmpty().withMessage('ID do produto é obrigatório'),
  body('produtos.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
  handleValidationErrors
];

// Validações para autenticação
const validateLogin = [
  body('username').notEmpty().withMessage('Username é obrigatório'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  handleValidationErrors
];

// Validações para parâmetros de rota
const validateId = [
  param('id').notEmpty().withMessage('ID é obrigatório'),
  handleValidationErrors
];

// Validações para consultas de período
const validatePeriodo = [
  query('data_inicio').optional().isISO8601().withMessage('Data início deve ser uma data válida'),
  query('data_fim').optional().isISO8601().withMessage('Data fim deve ser uma data válida'),
  handleValidationErrors
];

module.exports = {
  validateProduto,
  validateFornecedor,
  validateAfiliado,
  validateVenda,
  validateConjunto,
  validateKit,
  validateLogin,
  validateId,
  validatePeriodo,
  handleValidationErrors
};
