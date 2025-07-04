
#!/bin/bash

cd "$(dirname "$0")/.."

echo "🔧 Instalando Sistema vertttraue..."

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado. Por favor, instale o PostgreSQL primeiro."
    echo "Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    echo "Visite: https://nodejs.org/"
    exit 1
fi

echo "📦 Instalando dependências do Node.js..."
npm install express pg cors helmet express-rate-limit bcrypt jsonwebtoken dotenv multer

echo "🗄️ Configurando banco de dados..."
read -p "Digite o nome do banco de dados (padrão: vertttraue_db): " dbname
dbname=${dbname:-vertttraue_db}

read -p "Digite o usuário do PostgreSQL (padrão: postgres): " dbuser
dbuser=${dbuser:-postgres}

read -s -p "Digite a senha do PostgreSQL: " dbpass
echo

# Criar banco de dados
echo "Criando banco de dados..."
PGPASSWORD=$dbpass createdb -h localhost -U $dbuser $dbname

# Executar schema
echo "Executando schema do banco..."
PGPASSWORD=$dbpass psql -h localhost -U $dbuser -d $dbname -f database/schema.sql

# Criar arquivo .env
echo "📝 Criando arquivo de configuração..."
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$dbname
DB_USER=$dbuser
DB_PASSWORD=$dbpass
PORT=3001
NODE_ENV=production
JWT_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=http://localhost:8080
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
EOF

# Criar diretório de uploads
mkdir -p uploads

echo "✅ Instalação concluída!"
echo "🚀 Para iniciar o servidor, execute: npm start"
echo "📊 Health check estará disponível em: http://localhost:3001/health"
echo "🔑 Credenciais padrão: admin / admin123"
