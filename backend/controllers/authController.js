const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'vertttraue-secret-key-2024';

// Função para criar tabelas se não existirem
const ensureTablesExist = async () => {
  const client = await pool.connect();
  try {
    // Criar tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nome VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de fornecedores
    await client.query(`
      CREATE TABLE IF NOT EXISTS fornecedores (
        id VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cidade VARCHAR(255),
        contato VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de afiliados
    await client.query(`
      CREATE TABLE IF NOT EXISTS afiliados (
        id VARCHAR(50) PRIMARY KEY,
        nome_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        telefone VARCHAR(50),
        comissao DECIMAL(5,2) DEFAULT 0,
        ativo BOOLEAN DEFAULT true,
        tipo_chave_pix VARCHAR(50),
        chave_pix VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de produtos
    await client.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        estoque_fisico INTEGER DEFAULT 0,
        estoque_site INTEGER DEFAULT 0,
        preco DECIMAL(10,2) DEFAULT 0,
        preco_compra DECIMAL(10,2) DEFAULT 0,
        fornecedor_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
      )
    `);

    // Criar tabela de estoque de afiliados
    await client.query(`
      CREATE TABLE IF NOT EXISTS afiliado_estoque (
        id SERIAL PRIMARY KEY,
        produto_id VARCHAR(50) NOT NULL,
        afiliado_id VARCHAR(50) NOT NULL,
        quantidade INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
        FOREIGN KEY (afiliado_id) REFERENCES afiliados(id) ON DELETE CASCADE,
        UNIQUE(produto_id, afiliado_id)
      )
    `);

    // Criar tabela de fotos de produtos
    await client.query(`
      CREATE TABLE IF NOT EXISTS produto_fotos (
        id SERIAL PRIMARY KEY,
        produto_id VARCHAR(50) NOT NULL,
        url_foto TEXT NOT NULL,
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
      )
    `);

    // Criar tabela de vendas
    await client.query(`
      CREATE TABLE IF NOT EXISTS vendas (
        id VARCHAR(50) PRIMARY KEY,
        data_venda DATE NOT NULL,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pendente',
        observacoes TEXT,
        afiliado_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (afiliado_id) REFERENCES afiliados(id)
      )
    `);

    // Criar tabela de produtos das vendas
    await client.query(`
      CREATE TABLE IF NOT EXISTS venda_produtos (
        id SERIAL PRIMARY KEY,
        venda_id VARCHAR(50) NOT NULL,
        produto_id VARCHAR(50),
        kit_id VARCHAR(50),
        conjunto_id VARCHAR(50),
        quantidade INTEGER NOT NULL,
        preco_unitario DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
        FOREIGN KEY (produto_id) REFERENCES produtos(id)
      )
    `);

    // Criar tabela de kits
    await client.query(`
      CREATE TABLE IF NOT EXISTS kits (
        id VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        preco DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de produtos dos kits
    await client.query(`
      CREATE TABLE IF NOT EXISTS kit_produtos (
        id SERIAL PRIMARY KEY,
        kit_id VARCHAR(50) NOT NULL,
        produto_id VARCHAR(50) NOT NULL,
        quantidade INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kit_id) REFERENCES kits(id) ON DELETE CASCADE,
        FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
      )
    `);

    // Criar tabela de conjuntos
    await client.query(`
      CREATE TABLE IF NOT EXISTS conjuntos (
        id VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        preco DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de produtos dos conjuntos
    await client.query(`
      CREATE TABLE IF NOT EXISTS conjunto_produtos (
        id SERIAL PRIMARY KEY,
        conjunto_id VARCHAR(50) NOT NULL,
        produto_id VARCHAR(50) NOT NULL,
        quantidade INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conjunto_id) REFERENCES conjuntos(id) ON DELETE CASCADE,
        FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Todas as tabelas verificadas/criadas com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Inicializar banco de dados
const initDatabase = async (req, res) => {
  try {
    console.log('🚀 Inicializando banco de dados...');
    
    await ensureTablesExist();
    
    // Verificar se admin já existe
    const adminExists = await pool.query(
      'SELECT id FROM usuarios WHERE username = $1',
      ['admin@vertttraue.com']
    );

    if (adminExists.rows.length === 0) {
      // Criar usuário admin
      const hashedPassword = await bcrypt.hash('123456', 10);
      await pool.query(
        'INSERT INTO usuarios (username, password_hash, nome) VALUES ($1, $2, $3)',
        ['admin@vertttraue.com', hashedPassword, 'Administrador']
      );
      console.log('✅ Usuário admin criado: admin@vertttraue.com / 123456');
    } else {
      console.log('✅ Usuário admin já existe');
    }

    // Criar fornecedores de exemplo
    const fornecedorExists = await pool.query('SELECT id FROM fornecedores LIMIT 1');
    if (fornecedorExists.rows.length === 0) {
      await pool.query(`
        INSERT INTO fornecedores (id, nome, cidade, contato) VALUES 
        ('FORN-001', 'Fornecedor Exemplo', 'São Paulo', 'contato@exemplo.com'),
        ('FORN-002', 'Distribuidora ABC', 'Rio de Janeiro', '(21) 99999-9999')
      `);
      console.log('✅ Fornecedores de exemplo criados');
    }

    res.json({ 
      message: 'Banco de dados inicializado com sucesso',
      admin: {
        username: 'admin@vertttraue.com',
        password: '123456'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    res.status(500).json({ error: 'Erro ao inicializar banco de dados' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 Tentativa de login:', { username, password: '***' });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    // Verificar se usuário existe
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado:', username);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ Senha inválida para usuário:', username);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login realizado com sucesso:', username);
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

// Registrar novo usuário
const register = async (req, res) => {
  try {
    const { username, password, nome } = req.body;
    
    console.log('📝 Tentativa de registro:', { username, nome });

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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir usuário
    const result = await pool.query(
      'INSERT INTO usuarios (username, password_hash, nome) VALUES ($1, $2, $3) RETURNING id, username, nome',
      [username, hashedPassword, nome]
    );

    console.log('✅ Usuário registrado com sucesso:', username);
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro no registro:', error);
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
    
    // Buscar usuário atualizado
    const result = await pool.query(
      'SELECT id, username, nome FROM usuarios WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro na verificação do token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Testar conexão com banco
const testDatabase = async (req, res) => {
  try {
    console.log('🧪 Testando conexão com banco de dados...');
    
    // Teste básico de conexão
    const result = await pool.query('SELECT NOW() as timestamp, version() as version');
    console.log('✅ Conexão OK:', result.rows[0]);

    // Teste de tabelas
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tabelas encontradas:', tables.rows.map(t => t.table_name));

    // Teste específico da tabela usuarios
    const usuariosTest = await pool.query('SELECT COUNT(*) FROM usuarios');
    console.log('👥 Total de usuários:', usuariosTest.rows[0].count);

    // Teste da tabela fornecedores
    const fornecedoresTest = await pool.query('SELECT COUNT(*) FROM fornecedores');
    console.log('🏭 Total de fornecedores:', fornecedoresTest.rows[0].count);

    res.json({
      status: 'success',
      message: 'Banco de dados funcionando corretamente',
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version,
      tables: tables.rows.map(t => t.table_name),
      counts: {
        usuarios: usuariosTest.rows[0].count,
        fornecedores: fornecedoresTest.rows[0].count
      }
    });
  } catch (error) {
    console.error('❌ Erro no teste do banco:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Erro ao conectar com banco de dados',
      error: error.message 
    });
  }
};

// Resetar usuário admin
const resetAdmin = async (req, res) => {
  try {
    console.log('🔄 Resetando usuário admin...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const result = await pool.query(`
      INSERT INTO usuarios (username, password_hash, nome) 
      VALUES ($1, $2, $3)
      ON CONFLICT (username) 
      DO UPDATE SET password_hash = $2, nome = $3
      RETURNING id, username, nome
    `, ['admin@vertttraue.com', hashedPassword, 'Administrador']);

    console.log('✅ Admin resetado:', result.rows[0]);
    res.json({
      message: 'Usuário admin resetado com sucesso',
      credentials: {
        username: 'admin@vertttraue.com',
        password: '123456'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao resetar admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar usuário
const createUser = async (req, res) => {
  try {
    const { username, password, nome } = req.body;
    
    console.log('👤 Criando usuário:', { username, nome });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO usuarios (username, password_hash, nome) VALUES ($1, $2, $3) RETURNING id, username, nome',
      [username, hashedPassword, nome || username]
    );

    console.log('✅ Usuário criado:', result.rows[0]);
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  initDatabase,
  login,
  register,
  verify,
  testDatabase,
  resetAdmin,
  createUser
};
