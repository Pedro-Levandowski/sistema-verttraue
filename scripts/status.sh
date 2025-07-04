
#!/bin/bash

# Script para verificar status dos serviços

cd "$(dirname "$0")/.."

echo "📊 === STATUS DO SISTEMA ==="
echo "📅 $(date)"
echo ""

# Verificar se processos estão rodando
if pgrep -f "node.*app.js" > /dev/null; then
    echo "✅ Backend: Rodando"
    echo "   PID: $(pgrep -f 'node.*app.js')"
else
    echo "❌ Backend: Parado"
fi

if pgrep -f "python3.*http.server\|serve.*8080" > /dev/null; then
    echo "✅ Frontend: Rodando"
    echo "   PID: $(pgrep -f 'python3.*http.server\|serve.*8080')"
else
    echo "❌ Frontend: Parado"
fi

echo ""
echo "🌐 URLs de teste:"
IP=$(hostname -I | awk '{print $1}')
echo "   Frontend: http://$IP:8080"
echo "   Backend API: http://$IP:3001"
echo "   Health Check: http://$IP:3001/health"

echo ""
echo "📋 Para ver logs:"
echo "   Backend: tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
