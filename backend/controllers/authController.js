
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'vertttraue_secret_key_2024';

// Função para testar conexão direta com banco
const testDatabase = async (req, res) => {
  try {
    console.log('🔍 === TESTE DE CONEXÃO COM BANCO ===');
    
    // Teste 1: Verificar se consegue executar query básica
    const timeResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Query básica executada:', timeResult.rows[0]);
    
    // Teste 2: Verificar se tabela usuarios_admin existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios_admin'
      );
    `);
    console.log('📋 Tabela usuarios_admin existe:', tableCheck.rows[0].exists);
    
    // Teste 3: Se tabela não existe, criar
    if (!tableCheck.rows[0].exists) {
      console.log('🔧 Criando tabela usuarios_admin...');
      await pool.query(`
        CREATE TABLE usuarios_admin (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela usuarios_admin criada');
    }
    
    // Teste 4: Listar todos os usuários existentes
    const allUsers = await pool.query('SELECT id, username, created_at FROM usuarios_admin');
    console.log('👥 Usuários existentes:', allUsers.rows);
    
    // Teste 5: Verificar estrutura da tabela
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios_admin'
      ORDER BY ordinal_position;
    `);
    console.log('🏗️ Estrutura da tabela:', tableStructure.rows);
    
    res.json({
      success: true,
      message: 'Teste de banco executado com sucesso',
      results: {
        connection: 'OK',
        current_time: timeResult.rows[0].current_time,
        table_exists: tableCheck.rows[0].exists,
        users_count: allUsers.rows.length,
        existing_users: allUsers.rows,
        table_structure: tableStructure.rows
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste de banco:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao testar banco de dados',
      details: error.message,
      stack: error.stack
    });
  }
};

// Login de usuário - VERSÃO CORRIGIDA
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 === INÍCIO DO LOGIN CORRIGIDO ===');
    console.log('📥 Dados recebidos:', { username, password: password ? '***' : 'undefined' });

    if (!username || !password) {
      console.log('❌ Dados incompletos');
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    console.log('🔍 Buscando usuário no banco de dados...');
    
    // Buscar usuário no banco - com logs detalhados
    const userQuery = 'SELECT * FROM usuarios_admin WHERE username = $1';
    console.log('📝 Query executada:', userQuery, [username]);
    
    const userResult = await pool.query(userQuery, [username]);
    console.log(`📊 Resultado da busca: ${userResult.rows.length} usuários encontrados`);

    if (userResult.rows.length === 0) {
      console.log('❌ Usuário não encontrado:', username);
      
      // Debug: buscar todos os usuários para comparação
      const allUsers = await pool.query('SELECT username FROM usuarios_admin');
      console.log('📋 Usuários existentes no banco:', allUsers.rows.map(u => u.username));
      
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = userResult.rows[0];
    console.log('✅ Usuário encontrado:', { 
      id: user.id, 
      username: user.username,
      password_hash_exists: !!user.password_hash,
      password_hash_length: user.password_hash ? user.password_hash.length : 0,
      password_hash_start: user.password_hash ? user.password_hash.substring(0, 10) + '...' : 'N/A'
    });

    // Verificar senha com logs detalhados
    console.log('🔑 Verificando senha...');
    console.log('🔑 Senha fornecida (hash):', await bcrypt.hash(password, 10));
    console.log('🔑 Hash no banco:', user.password_hash);
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Senha válida:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Senha inválida para usuário:', username);
      // Debug adicional: tentar comparar com hash conhecido
      const testHash = await bcrypt.hash('123456', 10);
      const testCompare = await bcrypt.compare('123456', testHash);
      console.log('🧪 Teste de hash/compare funcionando:', testCompare);
      
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

// Registrar novo usuário - VERSÃO CORRIGIDA
const register = async (req, res) => {
  try {
    const { username, password, nome } = req.body;

    console.log('📝 === INÍCIO DO REGISTRO CORRIGIDO ===');
    console.log('📝 Tentativa de registro:', { username, nome, password: password ? '***' : 'undefined' });

    if (!username || !password) {
      console.log('❌ Dados incompletos para registro');
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    // Verificar se usuário já existe - com logs detalhados
    console.log('🔍 Verificando se usuário já existe...');
    const existingUserQuery = 'SELECT id, username FROM usuarios_admin WHERE username = $1';
    console.log('📝 Query executada:', existingUserQuery, [username]);
    
    const existingUser = await pool.query(existingUserQuery, [username]);
    console.log(`📊 Usuários encontrados com mesmo username: ${existingUser.rows.length}`);

    if (existingUser.rows.length > 0) {
      console.log('❌ Usuário já existe:', username);
      console.log('👤 Usuário existente:', existingUser.rows[0]);
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash da senha
    console.log('🔒 Gerando hash da senha...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('🔒 Hash gerado:', passwordHash.substring(0, 20) + '...');

    // Inserir usuário
    console.log('💾 Inserindo usuário no banco...');
    const insertQuery = 'INSERT INTO usuarios_admin (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at';
    console.log('📝 Query executada:', insertQuery, [username, '***']);
    
    const result = await pool.query(insertQuery, [username, passwordHash]);
    console.log('✅ Usuário criado:', result.rows[0]);

    // Verificar se realmente foi inserido
    const verifyInsert = await pool.query('SELECT * FROM usuarios_admin WHERE username = $1', [username]);
    console.log('✅ Verificação pós-inserção:', verifyInsert.rows[0]);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ === ERRO NO REGISTRO ===');
    console.error('Stack trace:', error.stack);
    console.error('Erro completo:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
};

// Função para resetar/recriar usuário admin
const resetAdmin = async (req, res) => {
  try {
    console.log('🔄 === RESETANDO USUÁRIO ADMIN ===');
    
    // Deletar usuário admin existente
    await pool.query('DELETE FROM usuarios_admin WHERE username = $1', ['admin@vertttraue.com']);
    console.log('🗑️ Usuário admin deletado (se existia)');
    
    // Criar novo usuário admin
    const adminPassword = '123456';
    const adminHash = await bcrypt.hash(adminPassword, 10);
    console.log('🔒 Novo hash criado para admin:', adminHash.substring(0, 20) + '...');
    
    const result = await pool.query(
      'INSERT INTO usuarios_admin (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      ['admin@vertttraue.com', adminHash]
    );
    
    console.log('✅ Novo usuário admin criado:', result.rows[0]);
    
    res.json({
      message: 'Usuário admin resetado com sucesso',
      user: result.rows[0],
      credentials: {
        username: 'admin@vertttraue.com',
        password: '123456'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao resetar admin:', error);
    res.status(500).json({ error: 'Erro ao resetar admin', details: error.message });
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

module.exports = {
  login,
  verifyToken,
  register,
  testDatabase,
  resetAdmin
};
