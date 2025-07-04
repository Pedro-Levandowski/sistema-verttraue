
#!/bin/bash

cd "$(dirname "$0")/.."

# Script para reiniciar o sistema na VPS

set -e

echo "🔄 === REINICIANDO SISTEMA ==="
echo "📅 $(date)"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Criar diretórios necessários
mkdir -p logs pids

log_info "Parando processos existentes..."

# Parar usando PIDs salvos
if [ -f "pids/backend.pid" ]; then
    BACKEND_PID=$(cat pids/backend.pid)
    kill $BACKEND_PID || true
    rm -f pids/backend.pid
fi

if [ -f "pids/frontend.pid" ]; then
    FRONTEND_PID=$(cat pids/frontend.pid)
    kill $FRONTEND_PID || true
    rm -f pids/frontend.pid
fi

# Matar qualquer processo remanescente
pkill -f "node.*app.js" || true
pkill -f "python3.*http.server" || true
pkill -f "serve.*8080" || true

sleep 2

log_info "Fazendo git pull..."
git pull origin main || git pull origin master || {
    log_warn "Git pull falhou. Continuando sem atualização..."
}

log_info "Executando deploy..."
chmod +x scripts/deploy.sh
./scripts/deploy.sh

log_info "✅ Sistema reiniciado com sucesso!"
