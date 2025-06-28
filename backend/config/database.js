
const { Pool } = require('pg');
require('dotenv').config();

console.log('🗄️ === CONFIGURAÇÃO DO BANCO ===');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PORT:', process.env.DB_PORT || 5432);
console.log('DB_NAME:', process.env.DB_NAME || 'vertttraue_db');
console.log('DB_USER:', process.env.DB_USER || 'postgres');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'não definida');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'vertttraue_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', (client) => {
  console.log('✅ Nova conexão estabelecida com PostgreSQL');
});

pool.on('error', (err, client) => {
  console.error('❌ Erro na conexão com PostgreSQL:', err);
  console.error('Cliente:', client);
});

// Testar conexão imediatamente
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Erro ao testar conexão:', err);
  } else {
    console.log('✅ Conexão com banco testada com sucesso:', result.rows[0]);
  }
});

module.exports = pool;
