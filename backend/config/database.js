
const { Pool } = require('pg');
require('dotenv').config();

console.log('🗄️ === CONFIGURAÇÃO DETALHADA DO BANCO ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PORT:', process.env.DB_PORT || 5432);
console.log('DB_NAME:', process.env.DB_NAME || 'vertttraue_db');
console.log('DB_USER:', process.env.DB_USER || 'postgres');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'não definida');

const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'vertttraue_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Configurações adicionais para debug
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
  min: 2,
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200
};

console.log('📊 Configuração do pool:', {
  user: config.user,
  host: config.host,
  database: config.database,
  port: config.port,
  ssl: config.ssl,
  max: config.max
});

const pool = new Pool(config);

// Eventos do pool para monitoramento
pool.on('connect', (client) => {
  console.log('✅ Nova conexão estabelecida com PostgreSQL');
  console.log('📊 Total de conexões:', pool.totalCount);
  console.log('📊 Conexões ativas:', pool.idleCount);
});

pool.on('acquire', (client) => {
  console.log('🔄 Cliente adquirido do pool');
});

pool.on('release', (client) => {
  console.log('↩️ Cliente retornado ao pool');
});

pool.on('remove', (client) => {
  console.log('❌ Cliente removido do pool');
});

pool.on('error', (err, client) => {
  console.error('💥 === ERRO CRÍTICO NA CONEXÃO COM PostgreSQL ===');
  console.error('Erro:', err);
  console.error('Code:', err.code);
  console.error('Cliente:', client ? 'presente' : 'ausente');
  
  // Log detalhado baseado no tipo de erro
  switch (err.code) {
    case 'ECONNREFUSED':
      console.error('🚨 PostgreSQL não está rodando ou não está aceitando conexões');
      console.error('💡 Solução: sudo service postgresql start');
      break;
    case 'ENOTFOUND':
      console.error('🚨 Host do banco não encontrado');
      console.error('💡 Solução: Verifique DB_HOST no .env');
      break;
    case '3D000':
      console.error('🚨 Banco de dados não existe');
      console.error('💡 Solução: CREATE DATABASE vertttraue_db;');
      break;
    case '28P01':
      console.error('🚨 Falha na autenticação');
      console.error('💡 Solução: Verifique DB_USER e DB_PASSWORD no .env');
      break;
    default:
      console.error('🚨 Erro desconhecido:', err.code);
  }
  
  process.exit(-1);
});

// Teste de conexão inicial mais robusto
const testInitialConnection = async () => {
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log(`🔄 Tentativa ${4 - retries}/3 de conexão com banco...`);
      
      const result = await pool.query('SELECT NOW() as timestamp, version() as version');
      
      console.log('✅ === CONEXÃO COM BANCO ESTABELECIDA COM SUCESSO ===');
      console.log('🕐 Timestamp:', result.rows[0].timestamp);
      console.log('🗄️ Versão PostgreSQL:', result.rows[0].version);
      console.log('📊 Pool status:', {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      });
      
      // Testar se tabela usuarios existe
      try {
        const tableTest = await pool.query("SELECT COUNT(*) FROM usuarios LIMIT 1");
        console.log('✅ Tabela usuarios acessível');
      } catch (tableError) {
        if (tableError.code === '42P01') {
          console.log('⚠️ Tabela usuarios não existe - será necessário criar');
        } else {
          console.log('⚠️ Erro ao acessar tabela usuarios:', tableError.message);
        }
      }
      
      break;
      
    } catch (error) {
      retries--;
      console.error(`❌ Tentativa ${4 - retries}/3 falhou:`, error.message);
      console.error('Code:', error.code);
      
      if (retries === 0) {
        console.error('💥 === FALHA CRÍTICA NA CONEXÃO COM BANCO ===');
        console.error('🚨 Todas as tentativas falharam!');
        console.error('📋 Checklist de troubleshooting:');
        console.error('1. PostgreSQL está rodando? `sudo service postgresql status`');
        console.error('2. Banco vertttraue_db existe? `psql -U postgres -l`');
        console.error('3. Credenciais corretas no .env?');
        console.error('4. Firewall/porta 5432 liberada?');
        console.error('');
        console.error('Erro original:', error);
        
        // Não sair do processo, mas avisar
        console.error('⚠️ Aplicação continuará, mas banco não está disponível');
      } else {
        console.log(`⏳ Aguardando 2s antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
};

// Executar teste inicial
testInitialConnection();

module.exports = pool;
