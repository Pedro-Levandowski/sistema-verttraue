
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP por janela de tempo
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Importar rotas
const authRoutes = require('./routes/auth');
const produtosRoutes = require('./routes/produtos');
const fornecedoresRoutes = require('./routes/fornecedores');
const afiliadosRoutes = require('./routes/afiliados');
const vendasRoutes = require('./routes/vendas');
const conjuntosRoutes = require('./routes/conjuntos');
const kitsRoutes = require('./routes/kits');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/afiliados', afiliadosRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/conjuntos', conjuntosRoutes);
app.use('/api/kits', kitsRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'vertttraue-backend',
    version: '2.0.0',
    database: process.env.DB_NAME || 'vertttraue_db',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota para listar todas as rotas disponíveis
app.get('/api', (req, res) => {
  res.json({
    message: 'API Vertttraue - Sistema de Gestão Comercial',
    version: '2.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Login de usuário',
        'GET /api/auth/verify': 'Verificar token JWT',
        'POST /api/auth/register': 'Registrar usuário (dev only)'
      },
      produtos: {
        'GET /api/produtos': 'Listar todos os produtos',
        'GET /api/produtos/:id': 'Buscar produto por ID',
        'POST /api/produtos': 'Criar novo produto',
        'PUT /api/produtos/:id': 'Atualizar produto',
        'DELETE /api/produtos/:id': 'Deletar produto'
      },
      fornecedores: {
        'GET /api/fornecedores': 'Listar todos os fornecedores',
        'GET /api/fornecedores/:id': 'Buscar fornecedor por ID',
        'GET /api/fornecedores/:id/produtos': 'Produtos de um fornecedor',
        'POST /api/fornecedores': 'Criar novo fornecedor',
        'PUT /api/fornecedores/:id': 'Atualizar fornecedor',
        'DELETE /api/fornecedores/:id': 'Deletar fornecedor'
      },
      afiliados: {
        'GET /api/afiliados': 'Listar todos os afiliados',
        'GET /api/afiliados/:id': 'Buscar afiliado por ID',
        'GET /api/afiliados/:id/estoque': 'Estoque de um afiliado',
        'POST /api/afiliados': 'Criar novo afiliado',
        'PUT /api/afiliados/:id': 'Atualizar afiliado',
        'DELETE /api/afiliados/:id': 'Deletar afiliado'
      },
      vendas: {
        'GET /api/vendas': 'Listar todas as vendas',
        'GET /api/vendas/periodo': 'Vendas por período',
        'GET /api/vendas/:id': 'Buscar venda por ID',
        'POST /api/vendas': 'Criar nova venda',
        'PUT /api/vendas/:id': 'Atualizar venda',
        'DELETE /api/vendas/:id': 'Deletar venda'
      },
      conjuntos: {
        'GET /api/conjuntos': 'Listar todos os conjuntos',
        'GET /api/conjuntos/:id': 'Buscar conjunto por ID',
        'POST /api/conjuntos': 'Criar novo conjunto',
        'PUT /api/conjuntos/:id': 'Atualizar conjunto',
        'DELETE /api/conjuntos/:id': 'Deletar conjunto'
      },
      kits: {
        'GET /api/kits': 'Listar todos os kits',
        'GET /api/kits/:id': 'Buscar kit por ID',
        'POST /api/kits': 'Criar novo kit',
        'PUT /api/kits/:id': 'Atualizar kit',
        'DELETE /api/kits/:id': 'Deletar kit'
      }
    },
    documentation: 'Todas as rotas (exceto auth) requerem autenticação via Bearer token'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 ======================================');
  console.log(`🚀 Servidor vertttraue rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🗄️ Banco de dados: ${process.env.DB_NAME || 'vertttraue_db'}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ======================================');
});

module.exports = app;
