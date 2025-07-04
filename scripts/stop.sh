
#!/bin/bash

# Script para parar todos os serviços

echo "🛑 === PARANDO SISTEMA ==="

# Parar usando PIDs salvos
if [ -f "pids/backend.pid" ]; then
    BACKEND_PID=$(cat pids/backend.pid)
    kill $BACKEND_PID || true
    rm -f pids/backend.pid
    echo "✅ Backend parado (PID: $BACKEND_PID)"
fi

if [ -f "pids/frontend.pid" ]; then
    FRONTEND_PID=$(cat pids/frontend.pid)
    kill $FRONTEND_PID || true
    rm -f pids/frontend.pid
    echo "✅ Frontend parado (PID: $FRONTEND_PID)"
fi

# Matar qualquer processo remanescente
pkill -f "node.*app.js" || true
pkill -f "python3.*http.server" || true
pkill -f "serve.*8080" || true

echo "🛑 Sistema parado completamente"
