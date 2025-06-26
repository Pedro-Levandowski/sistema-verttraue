
#!/bin/bash

echo "💾 Criando backup do banco de dados..."

# Carregar variáveis do .env
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
else
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

# Criar diretório de backups se não existir
mkdir -p backups

# Nome do arquivo de backup com timestamp
backup_file="backups/vertttraue_backup_$(date +%Y%m%d_%H%M%S).sql"

# Criar backup
echo "Criando backup em: $backup_file"
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $backup_file

if [ $? -eq 0 ]; then
    echo "✅ Backup criado com sucesso: $backup_file"
    
    # Manter apenas os últimos 10 backups
    ls -t backups/vertttraue_backup_*.sql | tail -n +11 | xargs -r rm
    echo "🧹 Backups antigos removidos (mantendo os 10 mais recentes)"
else
    echo "❌ Erro ao criar backup"
    exit 1
fi
