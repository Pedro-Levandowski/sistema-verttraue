const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de logging detalhado
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`📥 ${timestamp} - ${method} ${url} from ${ip}`);
  
  // Log do body em requests POST/PUT (sem mostrar senhas)
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '***';
    console.log(`📤 Body:`, logBody);
  }
  
  next();
});

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting - CORRIGIDO para evitar too many requests
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos (aumentado)
  max: 1000, // máximo 1000 requests por IP (aumentado significativamente)
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Importar rotas
const authRoutes = require('./routes/auth');
const produtosRoutes = require('./routes/produtos');
const fornecedoresRoutes = require('./routes/fornecedores');
const afiliadosRoutes = require('./routes/afiliados');
const vendasRoutes = require('./routes/vendas');
const conjuntosRoutes = require('./routes/conjuntos');
const kitsRoutes = require('./routes/kits');
const estoqueRoutes = require('./routes/estoque');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/afiliados', afiliadosRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/conjuntos', conjuntosRoutes);
app.use('/api/kits', kitsRoutes);
app.use('/api/estoque', estoqueRoutes);

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
      },
      estoque: {
        'PUT /api/estoque/afiliado': 'Atualizar estoque de afiliado',
        'GET /api/estoque/afiliado/:afiliado_id': 'Buscar estoque por afiliado'
      }
    },
    documentation: 'Todas as rotas (exceto auth) requerem autenticação via Bearer token'
  });
});

// Middleware de tratamento de erros MELHORADO
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error('💥 === ERRO NÃO TRATADO ===');
  console.error('🕐 Timestamp:', timestamp);
  console.error('🌐 URL:', req.originalUrl);
  console.error('📥 Method:', req.method);
  console.error('💀 Erro:', err);
  console.error('📊 Stack:', err.stack);
  
  // Log específico por tipo de erro
  if (err.code) {
    console.error('🔢 Error Code:', err.code);
  }
  
  if (err.name) {
    console.error('📛 Error Name:', err.name);
  }
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    timestamp: timestamp,
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  console.log('❓ Rota não encontrada:', req.method, req.originalUrl);
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
