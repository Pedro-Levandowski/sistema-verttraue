
#!/bin/bash

cd "$(dirname "$0")/.."

# Script para visualizar logs

if [ "$1" = "backend" ]; then
    echo "📋 === LOGS DO BACKEND ==="
    tail -f logs/backend.log
elif [ "$1" = "frontend" ]; then
    echo "📋 === LOGS DO FRONTEND ==="
    tail -f logs/frontend.log
else
    echo "📋 === LOGS DO SISTEMA ==="
    echo "Backend (últimas 20 linhas):"
    tail -n 20 logs/backend.log 2>/dev/null || echo "Log do backend não encontrado"
    echo ""
    echo "Frontend (últimas 20 linhas):"
    tail -n 20 logs/frontend.log 2>/dev/null || echo "Log do frontend não encontrado"
    echo ""
    echo "Para acompanhar em tempo real:"
    echo "  ./scripts/logs.sh backend"
    echo "  ./scripts/logs.sh frontend"
fi
