
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
    console.log('🗄️ Testando conexão com banco...');
    
    // Primeiro testar a conexão
    const testConnection = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco OK:', testConnection.rows[0]);
    
    // Buscar usuário no banco - usando tabela 'usuarios'
    console.log('🔍 Executando query na tabela usuarios...');
    const userResult = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1',
      [username]
    );

    console.log('📊 Resultado da query:', {
      rowCount: userResult.rowCount,
      rows: userResult.rows.length
    });

    if (userResult.rows.length === 0) {
      console.log('❌ Usuário não encontrado:', username);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = userResult.rows[0];
    console.log('👤 Usuário encontrado:', { 
      id: user.id, 
      username: user.username, 
      nome: user.nome,
      hasPassword: !!user.password_hash
    });

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
    console.error('Tipo do erro:', typeof error);
    console.error('Nome do erro:', error.name);
    console.error('Mensagem:', error.message);
    console.error('Code:', error.code);
    console.error('Stack completo:', error.stack);
    
    // Verificar se é erro de conexão
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Erro de conexão com banco de dados',
        details: 'Verifique se o PostgreSQL está rodando',
        code: error.code
      });
    }
    
    // Verificar se é erro de tabela não existe
    if (error.code === '42P01') {
      return res.status(503).json({ 
        error: 'Tabela usuarios não encontrada',
        details: 'Execute o script de criação do banco',
        code: error.code
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      code: error.code || 'UNKNOWN'
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
    
    // Testar conexão primeiro
    const testConnection = await pool.query('SELECT NOW()');
    console.log('✅ Conexão OK para registro:', testConnection.rows[0]);
    
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
    console.error('Tipo do erro:', typeof error);
    console.error('Nome do erro:', error.name);
    console.error('Mensagem:', error.message);
    console.error('Code:', error.code);
    console.error('Stack completo:', error.stack);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Erro de conexão com banco de dados',
        details: 'Verifique se o PostgreSQL está rodando',
        code: error.code
      });
    }
    
    if (error.code === '42P01') {
      return res.status(503).json({ 
        error: 'Tabela usuarios não encontrada',
        details: 'Execute o script de criação do banco',
        code: error.code
      });
    }
    
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      code: error.code || 'UNKNOWN'
    });
  }
};

// Testar conexão com banco
const testDatabase = async (req, res) => {
  try {
    console.log('🗄️ === TESTE COMPLETO DE BANCO DE DADOS ===');
    
    // Teste 1: Conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const connectionTest = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Conexão OK:', connectionTest.rows[0]);

    // Teste 2: Verificar se tabelas existem
    console.log('2️⃣ Verificando tabelas...');
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tabelas = tableCheck.rows.map(t => t.table_name);
    console.log('📋 Tabelas encontradas:', tabelas);

    // Teste 3: Verificar especificamente a tabela usuarios
    console.log('3️⃣ Verificando estrutura da tabela usuarios...');
    let usuariosInfo = null;
    try {
      const usuariosStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        ORDER BY ordinal_position
      `);
      usuariosInfo = usuariosStructure.rows;
      console.log('📊 Estrutura tabela usuarios:', usuariosInfo);
    } catch (e) {
      console.log('❌ Tabela usuarios não existe');
      usuariosInfo = 'Tabela não existe';
    }

    // Teste 4: Contar registros
    console.log('4️⃣ Contando registros...');
    const counts = {};
    
    for (const tabela of ['usuarios', 'produtos', 'fornecedores', 'afiliados', 'vendas']) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${tabela}`);
        counts[tabela] = parseInt(countResult.rows[0].count);
        console.log(`📊 ${tabela}: ${counts[tabela]} registros`);
      } catch (e) {
        counts[tabela] = `Erro: ${e.message}`;
        console.log(`❌ ${tabela}: ${e.message}`);
      }
    }

    // Teste 5: Verificar usuários específicos
    console.log('5️⃣ Verificando usuários...');
    let usuarios = [];
    try {
      const usuariosResult = await pool.query('SELECT id, username, nome, created_at FROM usuarios LIMIT 5');
      usuarios = usuariosResult.rows;
      console.log('👥 Usuários encontrados:', usuarios);
    } catch (e) {
      console.log('❌ Erro ao buscar usuários:', e.message);
      usuarios = `Erro: ${e.message}`;
    }

    console.log('✅ === TESTE DE BANCO CONCLUÍDO ===');

    res.json({
      success: true,
      message: 'Teste de banco de dados completo',
      results: {
        conexao: 'OK',
        timestamp: connectionTest.rows[0].current_time,
        postgres_version: connectionTest.rows[0].pg_version,
        tabelas_existentes: tabelas,
        estrutura_usuarios: usuariosInfo,
        contagens: counts,
        usuarios_exemplo: usuarios
      }
    });

  } catch (error) {
    console.error('💥 === ERRO CRÍTICO NO TESTE DE BANCO ===');
    console.error('Tipo do erro:', typeof error);
    console.error('Nome do erro:', error.name);
    console.error('Mensagem:', error.message);
    console.error('Code:', error.code);
    console.error('Stack completo:', error.stack);
    
    let errorResponse = {
      success: false,
      error: 'Erro ao testar banco de dados',
      details: error.message,
      code: error.code || 'UNKNOWN',
      diagnostico: {}
    };

    // Diagnóstico específico baseado no tipo de erro
    if (error.code === 'ECONNREFUSED') {
      errorResponse.diagnostico = {
        problema: 'PostgreSQL não está rodando',
        solucao: 'Inicie o PostgreSQL: sudo service postgresql start'
      };
    } else if (error.code === 'ENOTFOUND') {
      errorResponse.diagnostico = {
        problema: 'Host do banco não encontrado',
        solucao: 'Verifique DB_HOST no arquivo .env'
      };
    } else if (error.code === '3D000') {
      errorResponse.diagnostico = {
        problema: 'Banco de dados não existe',
        solucao: 'Crie o banco: CREATE DATABASE vertttraue_db;'
      };
    } else if (error.code === '28P01') {
      errorResponse.diagnostico = {
        problema: 'Credenciais inválidas',
        solucao: 'Verifique DB_USER e DB_PASSWORD no .env'
      };
    }
    
    res.status(500).json(errorResponse);
  }
};

// Resetar usuário admin
const resetAdmin = async (req, res) => {
  try {
    console.log('🔄 === RESETANDO USUÁRIO ADMIN ===');
    
    const adminUsername = 'admin@vertttraue.com';
    const adminPassword = '123456';
    const adminNome = 'Administrador';

    // Testar conexão primeiro
    const testConnection = await pool.query('SELECT NOW()');
    console.log('✅ Conexão OK para reset:', testConnection.rows[0]);

    // Hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    console.log('🗑️ Removendo admin existente (se houver)...');
    const deleteResult = await pool.query('DELETE FROM usuarios WHERE username = $1', [adminUsername]);
    console.log('🗑️ Registros removidos:', deleteResult.rowCount);

    console.log('👤 Criando novo admin...');
    const result = await pool.query(
      'INSERT INTO usuarios (username, password_hash, nome) VALUES ($1, $2, $3) RETURNING id, username, nome, created_at',
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
    console.error('Tipo do erro:', typeof error);
    console.error('Nome do erro:', error.name);
    console.error('Mensagem:', error.message);
    console.error('Code:', error.code);
    console.error('Stack completo:', error.stack);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Erro de conexão com banco de dados',
        details: 'Verifique se o PostgreSQL está rodando',
        code: error.code
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro ao resetar admin',
      details: error.message,
      code: error.code || 'UNKNOWN'
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

    // Testar conexão primeiro
    const testConnection = await pool.query('SELECT NOW()');
    console.log('✅ Conexão OK para criação:', testConnection.rows[0]);

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
    console.error('Tipo do erro:', typeof error);
    console.error('Nome do erro:', error.name);
    console.error('Mensagem:', error.message);
    console.error('Code:', error.code);
    console.error('Stack completo:', error.stack);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Erro de conexão com banco de dados',
        details: 'Verifique se o PostgreSQL está rodando',
        code: error.code
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      code: error.code || 'UNKNOWN'
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
