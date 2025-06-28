
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'vertttraue_secret_key_2024';

// Login de usuário
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 === INÍCIO DO LOGIN ===');
    console.log('📥 Dados recebidos:', { username, password: password ? '***' : 'undefined' });

    if (!username || !password) {
      console.log('❌ Dados incompletos');
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    console.log('🔍 Buscando usuário no banco de dados...');
    
    // Buscar usuário no banco
    const userResult = await pool.query(
      'SELECT * FROM usuarios_admin WHERE username = $1',
      [username]
    );

    console.log(`📊 Resultado da busca: ${userResult.rows.length} usuários encontrados`);

    if (userResult.rows.length === 0) {
      console.log('❌ Usuário não encontrado:', username);
      
      // Vamos também tentar buscar todos os usuários para debug
      const allUsers = await pool.query('SELECT username FROM usuarios_admin');
      console.log('📋 Usuários existentes no banco:', allUsers.rows.map(u => u.username));
      
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = userResult.rows[0];
    console.log('✅ Usuário encontrado:', { 
      id: user.id, 
      username: user.username,
      password_hash_exists: !!user.password_hash,
      password_hash_length: user.password_hash ? user.password_hash.length : 0
    });

    // Verificar senha
    console.log('🔑 Verificando senha...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Senha válida:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Senha inválida para usuário:', username);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    console.log('🎟️ Gerando token JWT...');
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log('✅ === LOGIN BEM-SUCEDIDO ===');
    console.log('🎟️ Token gerado:', token.substring(0, 20) + '...');

    const response = {
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        username: user.username,
        nome: user.username
      }
    };

    console.log('📤 Resposta enviada:', { ...response, token: token.substring(0, 20) + '...' });

    res.json(response);
    
  } catch (error) {
    console.error('❌ === ERRO NO LOGIN ===');
    console.error('Stack trace:', error.stack);
    console.error('Erro completo:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
};

// Verificar token
const verifyToken = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔍 Verificando token:', token ? token.substring(0, 20) + '...' : 'não fornecido');

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token válido:', decoded);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    console.error('❌ Token inválido:', error.message);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Registrar novo usuário (apenas para desenvolvimento)
const register = async (req, res) => {
  try {
    const { username, password, nome } = req.body;

    console.log('📝 Tentativa de registro:', { username, nome });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = await pool.query(
      'SELECT id FROM usuarios_admin WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ Usuário já existe:', username);
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash da senha
    console.log('🔒 Gerando hash da senha...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Inserir usuário
    const result = await pool.query(
      'INSERT INTO usuarios_admin (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );

    console.log('✅ Usuário criado:', result.rows[0]);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
};

module.exports = {
  login,
  verifyToken,
  register
};
