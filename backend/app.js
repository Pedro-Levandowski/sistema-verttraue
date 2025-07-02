
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 === INICIANDO SERVIDOR BACKEND ===');
console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 'definido' : 'usando padrão');
console.log('🗄️ DB_NAME:', process.env.DB_NAME || 'vertttraue_db');

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 ${timestamp} - ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 1000,
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
      auth: [
        'POST /api/auth/login',
        'GET /api/auth/verify',
        'POST /api/auth/register',
        'POST /api/auth/init-database',
        'GET /api/auth/test-database',
        'POST /api/auth/reset-admin',
        'POST /api/auth/create-user'
      ],
      produtos: [
        'GET /api/produtos',
        'GET /api/produtos/:id',
        'POST /api/produtos',
        'PUT /api/produtos/:id',
        'DELETE /api/produtos/:id'
      ],
      vendas: [
        'GET /api/vendas',
        'GET /api/vendas/:id',
        'GET /api/vendas/periodo',
        'POST /api/vendas',
        'PUT /api/vendas/:id',
        'DELETE /api/vendas/:id'
      ]
    }
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('💥 === ERRO NO SERVIDOR ===');
  console.error('🕐 Timestamp:', new Date().toISOString());
  console.error('🌐 URL:', req.originalUrl);
  console.error('📥 Method:', req.method);
  console.error('💀 Erro:', err.message);
  console.error('📊 Stack:', err.stack);
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  console.log('❓ Rota não found:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 ======================================');
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log('🚀 ======================================');
});

module.exports = app;
