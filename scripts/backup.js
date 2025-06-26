
const { exec } = require('child_process');
const fs = require('fs');
require('dotenv').config();

function createBackup() {
  console.log('💾 Criando backup do banco de dados...');

  // Verificar se arquivo .env existe
  if (!fs.existsSync('.env')) {
    console.log('❌ Arquivo .env não encontrado!');
    process.exit(1);
  }

  // Criar diretório de backups se não existir
  if (!fs.existsSync('backups')) {
    fs.mkdirSync('backups');
  }

  // Nome do arquivo de backup com timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toTimeString().split(' ')[0].replace(/:/g, '');
  const backupFile = `backups/vertttraue_backup_${timestamp}.sql`;

  // Criar backup
  console.log(`Criando backup em: ${backupFile}`);
  
  const command = `pg_dump -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${backupFile}`;
  
  exec(command, { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD } }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erro ao criar backup:', error);
      process.exit(1);
    }

    console.log(`✅ Backup criado com sucesso: ${backupFile}`);
    
    // Manter apenas os últimos 10 backups
    fs.readdir('backups', (err, files) => {
      if (!err) {
        const backupFiles = files.filter(file => file.startsWith('vertttraue_backup_') && file.endsWith('.sql'))
                                .sort()
                                .reverse();
        
        if (backupFiles.length > 10) {
          const filesToDelete = backupFiles.slice(10);
          filesToDelete.forEach(file => {
            fs.unlinkSync(`backups/${file}`);
          });
          console.log('🧹 Backups antigos removidos (mantendo os 10 mais recentes)');
        }
      }
    });
  });
}

createBackup();
