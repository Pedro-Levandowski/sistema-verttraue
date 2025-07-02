
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/database');

// Usar a mesma chave JWT que está no authController
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-muito-segura';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔒 Middleware de autenticação executado');
  console.log('📋 Header authorization:', authHeader ? 'presente' : 'ausente');
  console.log('🎫 Token extraído:', token ? 'presente' : 'ausente');

  if (!token) {
    console.log('❌ Token não fornecido');
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    console.log('🔍 Verificando token com JWT_SECRET...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token válido, usuário:', decoded.username || decoded.userId);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Erro na verificação do token:', error.message);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  authenticateToken,
  generateToken,
  hashPassword,
  comparePassword
};
