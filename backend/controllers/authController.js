
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-muito-segura';

// Inicializar banco de dados
const initDatabase = async (req, res) => {
  try {
    console.log('🔧 Inicializando banco de dados...');
    
    // Criar usuário admin padrão
    const adminExists = await pool.query('SELECT id FROM usuarios WHERE username = $1', ['admin']);
    
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO usuarios (username, password, nome) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'Administrador']
      );
      console.log('✅ Usuário admin criado');
    } else {
      console.log('ℹ️ Usuário admin já existe');
    }

    res.json({ message: 'Banco de dados inicializado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    res.status(500).json({ error: 'Erro ao inicializar banco de dados' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔐 Tentativa de login:', username);

    const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.log('❌ Senha inválida');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('✅ Login bem-sucedido');
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        nome: user.nome 
      } 
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Verificar token
const verify = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, username, nome FROM usuarios WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Registrar usuário
const register = async (req, res) => {
  try {
    const { username, password, nome } = req.body;
    console.log('📝 Registrando usuário:', username);

    const existingUser = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (username, password, nome) VALUES ($1, $2, $3) RETURNING id, username, nome',
      [username, hashedPassword, nome || username]
    );

    console.log('✅ Usuário registrado');
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Testar conexão com banco
const testDatabase = async (req, res) => {
  try {
    console.log('🧪 Testando conexão com banco...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexão com banco OK');
    res.json({ 
      status: 'success', 
      message: 'Conexão com banco de dados OK',
      timestamp: result.rows[0].current_time 
    });
  } catch (error) {
    console.error('❌ Erro ao testar banco:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Erro ao conectar com banco de dados',
      details: error.message 
    });
  }
};

// Resetar usuário admin
const resetAdmin = async (req, res) => {
  try {
    console.log('🔄 Resetando usuário admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(
      'UPDATE usuarios SET password = $1 WHERE username = $2',
      [hashedPassword, 'admin']
    );

    console.log('✅ Usuário admin resetado');
    res.json({ message: 'Usuário admin resetado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao resetar admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar usuário
const createUser = async (req, res) => {
  try {
    const { username, password, nome } = req.body;
    console.log('👤 Criando usuário:', username);

    const existingUser = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (username, password, nome) VALUES ($1, $2, $3) RETURNING id, username, nome',
      [username, hashedPassword, nome || username]
    );

    console.log('✅ Usuário criado');
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  initDatabase,
  login,
  verify,
  register,
  testDatabase,
  resetAdmin,
  createUser
};
