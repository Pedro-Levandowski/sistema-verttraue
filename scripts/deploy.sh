#!/bin/bash

# Script de Deploy para VPS com IP fixo: 188.245.246.153

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Ir para a raiz do projeto
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BASE_DIR"

log_info "🚀 === INICIANDO DEPLOY NA VPS ==="
echo "📅 $(date)"

# Verifica se está na raiz do projeto
if [ ! -f "package.json" ]; then
    log_error "Arquivo package.json não encontrado. Execute o script a partir da pasta 'sistema-verttraue'."
    exit 1
fi

log_info "Parando processos antigos..."
pkill -f "node.*app.js" || true
pkill -f "npm.*start" || true
sleep 2

log_info "Instalando dependências do frontend..."
npm install

log_info "Instalando dependências do backend..."
cd backend
npm install
cd ..

log_info "Verificando .env do backend..."
if [ ! -f "backend/.env" ]; then
    log_warn "Arquivo .env não encontrado no backend!"
    log_warn "Copie e edite manualmente:"
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
    console.log('❌ Erro ao conectar com banco:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Banco conectado com sucesso:', res.rows[0].now);
    process.exit(0);
  }
});
"
cd ..

log_info "Iniciando backend..."
mkdir -p logs pids
nohup node backend/app.js > logs/backend.log 2>&1 &
BACKEND_PID=$!

sleep 4

log_info "Testando health check..."
if curl -s http://localhost:3001/health > /dev/null; then
    log_info "✅ Backend OK (PID $BACKEND_PID)"
else
    log_error "❌ Backend não respondeu ao health check"
    exit 1
fi

log_info "Iniciando frontend (porta 8080)..."
if command -v python3 &> /dev/null; then
    cd dist
    nohup python3 -m http.server 8080 > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    log_info "✅ Frontend servido com Python (PID $FRONTEND_PID)"
elif command -v serve &> /dev/null; then
    cd dist
    nohup serve -s . -l 8080 > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    log_info "✅ Frontend servido com serve (PID $FRONTEND_PID)"
else
    log_warn "Python3 ou serve não encontrado. Instale um deles."
    log_warn "npm install -g serve"
fi

echo $BACKEND_PID > pids/backend.pid
echo $FRONTEND_PID > pids/frontend.pid

echo ""
log_info "🎉 === DEPLOY FINALIZADO COM SUCESSO ==="
log_info "🌐 Frontend: http://188.245.246.153:8080"
log_info "🔧 Backend API: http://188.245.246.153:3001"
log_info "📋 Health Check: http://188.245.246.153:3001/health"
log_info "📊 Logs: tail -f logs/backend.log"
echo ""
