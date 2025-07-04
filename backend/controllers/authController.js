
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-muito-segura';

// Inicializar banco de dados - CORRIGIDO PARA USAR usuarios
const initDatabase = async (req, res) => {
  const client = await pool.connect();
  
  try {
    console.log('🔧 === INICIALIZANDO BANCO DE DADOS ===');
    
    await client.query('BEGIN');
    
    // Verificar se usuário admin existe na tabela usuarios
    const adminCheck = await client.query('SELECT id FROM usuarios WHERE username = $1', ['admin@vertttraue.com']);
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await client.query(
        'INSERT INTO usuarios (username, password_hash, nome) VALUES ($1, $2, $3)',
        ['admin@vertttraue.com', hashedPassword, 'Administrador']
      );
      console.log('✅ Usuário admin criado');
    } else {
      console.log('ℹ️ Usuário admin já existe');
    }
    
    await client.query('COMMIT');
    
    const userCount = await client.query('SELECT COUNT(*) FROM usuarios');
    
    res.json({ 
      success: true,
      message: 'Banco de dados inicializado com sucesso',
      tables: ['usuarios', 'fornecedores', 'produtos', 'afiliados', 'vendas', 'venda_itens'],
      userCount: parseInt(userCount.rows[0].count),
      adminCredentials: {
        username: 'admin@vertttraue.com',
        password: '123456'
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ === ERRO CRÍTICO NA INICIALIZAÇÃO ===');
    console.error('Erro completo:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Erro ao inicializar banco de dados',
      details: error.message,
      code: error.code
    });
  } finally {
    client.release();
  }
};

// Login - CORRIGIDO PARA USAR usuarios
const login = async (req, res) => {
  try {
    console.log('🔐 === INICIANDO LOGIN ===');
    console.log('📨 Request body:', req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('❌ Dados incompletos');
      return res.status(400).json({ 
        success: false,
        error: 'Username e senha são obrigatórios' 
      });
    }

    console.log('🔍 Buscando usuário:', username);
    const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado:', username);
      return res.status(401).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
    }

    const user = result.rows[0];
    console.log('✅ Usuário encontrado:', user.username);
    
    console.log('🔐 Verificando senha...');
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      console.log('❌ Senha inválida para:', username);
      return res.status(401).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
    }

    console.log('🎫 Gerando token JWT...');
    const token = jwt.sign(
      { userId: user.id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    console.log('✅ Login bem-sucedido para:', username);
    res.json({ 
      success: true,
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        nome: user.nome || user.username 
      } 
    });
  } catch (error) {
    console.error('❌ === ERRO CRÍTICO NO LOGIN ===');
    console.error('Erro completo:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor no login',
      details: error.message,
      code: error.code
    });
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

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Username e senha são obrigatórios' 
      });
    }

    const existingUser = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Usuário já existe' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (username, password_hash, nome) VALUES ($1, $2, $3) RETURNING id, username, nome',
      [username, hashedPassword, nome || username]
    );

    console.log('✅ Usuário registrado');
    res.status(201).json({ 
      success: true,
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};

// Testar conexão com banco
const testDatabase = async (req, res) => {
  try {
    console.log('🧪 Testando conexão com banco...');
    const timeResult = await pool.query('SELECT NOW() as current_time');
    
    // Tentar contar usuários na tabela usuarios
    let userCount = 0;
    try {
      const userCountResult = await pool.query('SELECT COUNT(*) FROM usuarios');
      userCount = parseInt(userCountResult.rows[0].count);
    } catch (tableError) {
      console.log('⚠️ Tabela usuarios não existe ainda');
    }
    
    console.log('✅ Conexão com banco OK');
    res.json({ 
      success: true,
      status: 'success', 
      message: 'Conexão com banco de dados OK',
      results: {
        timestamp: timeResult.rows[0].current_time,
        userCount: userCount
      }
    });
  } catch (error) {
    console.error('❌ Erro ao testar banco:', error);
    res.status(500).json({ 
      success: false,
      status: 'error',
      error: 'Erro ao conectar com banco de dados',
      details: error.message 
    });
  }
};

// Resetar usuário admin
const resetAdmin = async (req, res) => {
  try {
    console.log('🔄 === RESETANDO USUÁRIO ADMIN ===');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log('🔐 Senha hasheada gerada');
    
    // Primeiro tentar atualizar
    const updateResult = await pool.query(
      'UPDATE usuarios SET password_hash = $1 WHERE username = $2 RETURNING username',
      [hashedPassword, 'admin@vertttraue.com']
    );

    if (updateResult.rows.length === 0) {
      console.log('👤 Admin não existe, criando...');
      await pool.query(
        'INSERT INTO usuarios (username, password_hash, nome) VALUES ($1, $2, $3)',
        ['admin@vertttraue.com', hashedPassword, 'Administrador']
      );
    }

    console.log('✅ Usuário admin resetado/criado com sucesso');
    res.json({ 
      success: true,
      message: 'Usuário admin resetado com sucesso',
      admin: {
        username: 'admin@vertttraue.com',
        password: '123456'
      }
    });
  } catch (error) {
    console.error('❌ === ERRO AO RESETAR ADMIN ===');
    console.error('Erro completo:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor ao resetar admin',
      details: error.message,
      code: error.code
    });
  }
};

// Criar usuário
const createUser = async (req, res) => {
  try {
    console.log('👤 === CRIANDO USUÁRIO ===');
    console.log('📨 Request body:', req.body);
    
    const { username, password, nome } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      console.log('❌ Username inválido:', username);
      return res.status(400).json({ 
        success: false,
        error: 'Username é obrigatório e deve ser uma string válida' 
      });
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      console.log('❌ Password inválido');
      return res.status(400).json({ 
        success: false,
        error: 'Password é obrigatório e deve ser uma string válida' 
      });
    }

    console.log('🔍 Verificando se usuário já existe:', username);
    const existingUser = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username.trim()]);
    
    if (existingUser.rows.length > 0) {
      console.log('❌ Usuário já existe:', username);
      return res.status(400).json({ 
        success: false,
        error: 'Usuário já existe' 
      });
    }

    console.log('🔐 Gerando hash da senha...');
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    
    console.log('💾 Inserindo no banco de dados...');
    const result = await pool.query(
      'INSERT INTO usuarios (username, password_hash, nome) VALUES ($1, $2, $3) RETURNING id, username, nome',
      [username.trim(), hashedPassword, nome || username.trim()]
    );

    console.log('✅ Usuário criado com sucesso:', result.rows[0]);
    res.status(201).json({ 
      success: true,
      user: result.rows[0],
      credentials: {
        username: username.trim(),
        password: password.trim()
      }
    });
  } catch (error) {
    console.error('❌ === ERRO AO CRIAR USUÁRIO ===');
    console.error('Erro completo:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor ao criar usuário',
      details: error.message,
      code: error.code
    });
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
