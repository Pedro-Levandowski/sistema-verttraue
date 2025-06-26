
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('🔧 Configuração do Sistema vertttraue\n');

  try {
    // Verificar se PostgreSQL está instalado
    await new Promise((resolve, reject) => {
      exec('psql --version', (error) => {
        if (error) {
          console.log('❌ PostgreSQL não encontrado. Por favor, instale o PostgreSQL primeiro.');
          console.log('Ubuntu/Debian: sudo apt install postgresql postgresql-contrib');
          console.log('CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib');
          console.log('Windows/Mac: https://www.postgresql.org/download/');
          reject(error);
        } else {
          console.log('✅ PostgreSQL encontrado');
          resolve();
        }
      });
    });

    // Coletar informações do banco
    const dbname = await question('Digite o nome do banco de dados (padrão: vertttraue_db): ') || 'vertttraue_db';
    const dbuser = await question('Digite o usuário do PostgreSQL (padrão: postgres): ') || 'postgres';
    const dbpass = await question('Digite a senha do PostgreSQL: ');
    const dbhost = await question('Digite o host do PostgreSQL (padrão: localhost): ') || 'localhost';
    const dbport = await question('Digite a porta do PostgreSQL (padrão: 5432): ') || '5432';

    console.log('\n📦 Instalando dependências do backend...');
    
    // Instalar dependências do backend
    await new Promise((resolve, reject) => {
      exec('cd backend && npm install', (error, stdout, stderr) => {
        if (error) {
          console.error('Erro ao instalar dependências:', error);
          reject(error);
        } else {
          console.log('✅ Dependências do backend instaladas');
          resolve();
        }
      });
    });

    // Criar banco de dados
    console.log('\n🗄️ Criando banco de dados...');
    await new Promise((resolve, reject) => {
      exec(`createdb -h ${dbhost} -p ${dbport} -U ${dbuser} ${dbname}`, { 
        env: { ...process.env, PGPASSWORD: dbpass } 
      }, (error, stdout, stderr) => {
        if (error && !stderr.includes('already exists')) {
          console.error('Erro ao criar banco:', error);
          reject(error);
        } else {
          console.log('✅ Banco de dados criado/verificado');
          resolve();
        }
      });
    });

    // Executar schema
    console.log('📋 Executando schema do banco...');
    await new Promise((resolve, reject) => {
      exec(`psql -h ${dbhost} -p ${dbport} -U ${dbuser} -d ${dbname} -f database/schema.sql`, { 
        env: { ...process.env, PGPASSWORD: dbpass } 
      }, (error, stdout, stderr) => {
        if (error) {
          console.error('Erro ao executar schema:', error);
          reject(error);
        } else {
          console.log('✅ Schema executado com sucesso');
          resolve();
        }
      });
    });

    // Perguntar se quer dados de exemplo
    const seedData = await question('\nDeseja inserir dados de exemplo? (s/N): ');
    if (seedData.toLowerCase() === 's') {
      console.log('📊 Inserindo dados de exemplo...');
      await new Promise((resolve, reject) => {
        exec(`psql -h ${dbhost} -p ${dbport} -U ${dbuser} -d ${dbname} -f database/seeds.sql`, { 
          env: { ...process.env, PGPASSWORD: dbpass } 
        }, (error, stdout, stderr) => {
          if (error) {
            console.error('Erro ao inserir dados de exemplo:', error);
            reject(error);
          } else {
            console.log('✅ Dados de exemplo inseridos');
            resolve();
          }
        });
      });
    }

    // Criar arquivo .env no backend
    console.log('📝 Criando arquivo de configuração...');
    const envContent = `# Configuração do Banco de Dados PostgreSQL
DB_HOST=${dbhost}
DB_PORT=${dbport}
DB_NAME=${dbname}
DB_USER=${dbuser}
DB_PASSWORD=${dbpass}

# Configuração do Servidor
PORT=3001
NODE_ENV=development

# JWT Secret (mude para uma chave segura em produção)
JWT_SECRET=vertttraue_secret_key_2024_${Math.random().toString(36).substring(7)}

# Frontend URL para CORS
FRONTEND_URL=http://localhost:8080

# Upload de arquivos (para fotos dos produtos)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
`;

    fs.writeFileSync('backend/.env', envContent);
    
    // Criar diretório de uploads
    if (!fs.existsSync('backend/uploads')) {
      fs.mkdirSync('backend/uploads', { recursive: true });
    }

    console.log('\n✅ Configuração concluída com sucesso!');
    console.log('\n🚀 Para iniciar o sistema:');
    console.log('   node start.js (inicia frontend e backend)');
    console.log('   OU separadamente:');
    console.log('   Frontend: npm run dev');
    console.log('   Backend: cd backend && npm run dev');
    console.log('\n📊 Health check: http://localhost:3001/health');
    console.log('🔑 Credenciais padrão: admin / admin123');
    console.log('🌐 Frontend: http://localhost:8080');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup();
