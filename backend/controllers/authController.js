
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'vertttraue-secret-key-2024';

// Login
const login = async (req, res) => {
  try {
    console.log('🔐 === TENTATIVA DE LOGIN ===');
    console.log('📤 Body recebido:', req.body);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log('❌ Username ou password não fornecidos');
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    console.log('🔍 Buscando usuário:', username);
    
    // Buscar usuário no banco
    const userResult = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Usuário não encontrado:', username);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = userResult.rows[0];
    console.log('👤 Usuário encontrado:', { id: user.id, username: user.username, nome: user.nome });

    // Verificar senha
    console.log('🔐 Verificando senha...');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      console.log('❌ Senha incorreta para usuário:', username);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('✅ Senha correta! Gerando token...');

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        nome: user.nome 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🎫 Token gerado com sucesso');
    console.log('✅ === LOGIN REALIZADO COM SUCESSO ===');

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome
      }
    });

  } catch (error) {
    console.error('💥 === ERRO NO LOGIN ===');
    console.error('Stack completo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// Verificar token
const verifyToken = (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      valid: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Registrar usuário
const register = async (req, res) => {
  try {
    console.log('👤 === TENTATIVA DE REGISTRO ===');
    console.log('📤 Body recebido:', req.body);
    
    const { username, password, nome } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    console.log('🔍 Verificando se usuário já existe:', username);
    
    // Verificar se usuário já existe
    const existingUser = await pool.query(
      'SELECT id FROM usuarios WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ Usuário já existe:', username);
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    console.log('🔐 Gerando hash da senha...');
    
    // Hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log('💾 Inserindo usuário no banco...');
    
    // Inserir usuário
    const result = await pool.query(
      'INSERT INTO usuarios (username, password_hash, nome) VALUES ($1, $2, $3) RETURNING id, username, nome',
      [username, passwordHash, nome || username]
    );

    const newUser = result.rows[0];
    console.log('✅ Usuário criado:', newUser);
    console.log('✅ === REGISTRO REALIZADO COM SUCESSO ===');

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: newUser
    });

  } catch (error) {
    console.error('💥 === ERRO NO REGISTRO ===');
    console.error('Stack completo:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// Testar conexão com banco
const testDatabase = async (req, res) => {
  try {
    console.log('🗄️ === TESTE DE BANCO DE DADOS ===');
    
    // Teste básico de conexão
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexão OK:', connectionTest.rows[0]);

    // Verificar se tabela usuarios existe
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'produtos', 'fornecedores', 'afiliados', 'vendas')
    `);
    
    console.log('📋 Tabelas encontradas:', tableCheck.rows);

    // Contar registros nas tabelas principais
    const counts = {};
    
    try {
      const userCount = await pool.query('SELECT COUNT(*) FROM usuarios');
      counts.usuarios = parseInt(userCount.rows[0].count);
    } catch (e) {
      counts.usuarios = 'Tabela não existe';
    }

    try {
      const productCount = await pool.query('SELECT COUNT(*) FROM produtos');
      counts.produtos = parseInt(productCount.rows[0].count);
    } catch (e) {
      counts.produtos = 'Tabela não existe';
    }

    try {
      const supplierCount = await pool.query('SELECT COUNT(*) FROM fornecedores');
      counts.fornecedores = parseInt(supplierCount.rows[0].count);
    } catch (e) {
      counts.fornecedores = 'Tabela não existe';
    }

    try {
      const affiliateCount = await pool.query('SELECT COUNT(*) FROM afiliados');
      counts.afiliados = parseInt(affiliateCount.rows[0].count);
    } catch (e) {
      counts.afiliados = 'Tabela não existe';
    }

    try {
      const salesCount = await pool.query('SELECT COUNT(*) FROM vendas');
      counts.vendas = parseInt(salesCount.rows[0].count);
    } catch (e) {
      counts.vendas = 'Tabela não existe';
    }

    console.log('📊 Contagem de registros:', counts);

    res.json({
      success: true,
      message: 'Banco de dados funcionando corretamente',
      results: {
        conexao: 'OK',
        timestamp: connectionTest.rows[0].current_time,
        tabelas: tableCheck.rows.map(t => t.table_name),
        contagens: counts
      }
    });

  } catch (error) {
    console.error('💥 === ERRO NO TESTE DE BANCO ===');
    console.error('Stack completo:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao testar banco de dados',
      details: error.message,
      code: error.code
    });
  }
};

// Resetar usuário admin
const resetAdmin = async (req, res) => {
  try {
    console.log('🔄 === RESETANDO USUÁRIO ADMIN ===');
    
    const adminUsername = 'admin@vertttraue.com';
    const adminPassword = '123456';
    const adminNome = 'Administrador';

    // Hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    console.log('🗑️ Removendo admin existente (se houver)...');
    await pool.query('DELETE FROM usuarios WHERE username = $1', [adminUsername]);

    console.log('👤 Criando novo admin...');
    const result = await pool.query(
      'INSERT INTO usuarios (username, password_hash, nome) VALUES ($1, $2, $3) RETURNING id, username, nome',
      [adminUsername, passwordHash, adminNome]
    );

    const newAdmin = result.rows[0];
    console.log('✅ Admin resetado:', newAdmin);

    res.json({
      success: true,
      message: 'Usuário admin resetado com sucesso',
      admin: {
        username: adminUsername,
        password: adminPassword,
        nome: adminNome
      },
      user: newAdmin
    });

  } catch (error) {
    console.error('💥 === ERRO AO RESETAR ADMIN ===');
    console.error('Stack completo:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao resetar admin',
      details: error.message
    });
  }
};

// Criar usuário (novo endpoint)
const createUser = async (req, res) => {
  try {
    console.log('👤 === CRIANDO NOVO USUÁRIO ===');
    console.log('📤 Body recebido:', req.body);
    
    const { username, password, nome } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = await pool.query(
      'SELECT id FROM usuarios WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Inserir usuário
    const result = await pool.query(
      'INSERT INTO usuarios (username, password_hash, nome) VALUES ($1, $2, $3) RETURNING id, username, nome, created_at',
      [username, passwordHash, nome || username]
    );

    const newUser = result.rows[0];
    console.log('✅ Usuário criado:', newUser);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: newUser,
      credentials: {
        username: username,
        password: password // Retorna a senha em texto claro apenas para debug
      }
    });

  } catch (error) {
    console.error('💥 === ERRO AO CRIAR USUÁRIO ===');
    console.error('Stack completo:', error);
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

module.exports = {
  login,
  verifyToken,
  register,
  testDatabase,
  resetAdmin,
  createUser
};
