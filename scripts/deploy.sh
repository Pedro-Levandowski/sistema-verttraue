
#!/bin/bash

# Script de Deploy para VPS
# Este script deve ser executado na VPS após git pull

set -e  # Parar em caso de erro

cd "$(dirname "$0")/.."

echo "🚀 === INICIANDO DEPLOY NA VPS ==="
echo "📅 $(date)"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    log_error "Arquivo package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

log_info "Parando processos existentes..."
# Matar processos Node.js que possam estar rodando
pkill -f "node.*app.js" || true
pkill -f "npm.*start" || true
sleep 2

log_info "Instalando dependências do frontend..."
npm install

log_info "Instalando dependências do backend..."
cd backend
npm install
cd ..

log_info "Verificando arquivo .env..."
if [ ! -f "backend/.env" ]; then
    log_warn "Arquivo .env não encontrado no backend!"
    log_warn "Copie o .env.example e configure as variáveis:"
    log_warn "cp backend/.env.example backend/.env"
fi

log_info "Construindo frontend para produção..."
npm run build

log_info "Testando conexão com banco de dados..."
cd backend
node -e "
const pool = require('./config/database');
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('❌ Erro na conexão:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Banco conectado:', res.rows[0].now);
    process.exit(0);
  }
});
" || {
    log_error "Falha na conexão com banco de dados!"
    log_error "Verifique as configurações no .env"
    exit 1
}

log_info "Iniciando backend..."
nohup node app.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
sleep 3

log_info "Testando health check..."
if curl -s http://188.245.246.153:3001/health > /dev/null; then
    log_info "✅ Backend iniciado com sucesso (PID: $BACKEND_PID)"
else
    log_error "❌ Backend não respondeu ao health check"
    exit 1
fi

log_info "Configurando servidor web estático..."
# Servir arquivos estáticos do dist
if command -v python3 &> /dev/null; then
    cd dist
    nohup python3 -m http.server 8080 > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    log_info "✅ Frontend servido na porta 8080 (PID: $FRONTEND_PID)"
elif command -v serve &> /dev/null; then
    cd dist
    nohup serve -s . -l 8080 > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    log_info "✅ Frontend servido na porta 8080 (PID: $FRONTEND_PID)"
else
    log_warn "Python3 ou 'serve' não encontrado. Instale um deles:"
    log_warn "npm install -g serve"
fi

# Salvar PIDs para controle
echo $BACKEND_PID > pids/backend.pid
echo $FRONTEND_PID > pids/frontend.pid

echo ""
log_info "🎉 === DEPLOY CONCLUÍDO COM SUCESSO ==="
log_info "🌐 Frontend: http://$(hostname -I | awk '{print $1}'):8080"
log_info "🔧 Backend API: http://$(hostname -I | awk '{print $1}'):3001"
log_info "📋 Health Check: http://$(hostname -I | awk '{print $1}'):3001/health"
log_info "📊 Logs: tail -f logs/backend.log"
echo ""
