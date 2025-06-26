
const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Iniciando Sistema vertttraue...\n');

// Verificar se o backend foi configurado
if (!fs.existsSync('backend/.env')) {
  console.log('❌ Backend não configurado!');
  console.log('Execute primeiro: node scripts/setup.js');
  process.exit(1);
}

// Iniciar backend
console.log('🔧 Iniciando backend...');
const backend = spawn('npm', ['run', 'dev'], { 
  cwd: 'backend',
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
});

backend.on('close', (code) => {
  console.log(`Backend encerrado com código ${code}`);
});

// Aguardar 3 segundos antes de iniciar o frontend
setTimeout(() => {
  console.log('🎨 Iniciando frontend...');
  
  const frontend = spawn('npm', ['run', 'dev'], { 
    stdio: 'pipe',
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    console.log(`[FRONTEND] ${data.toString().trim()}`);
  });

  frontend.stderr.on('data', (data) => {
    console.error(`[FRONTEND ERROR] ${data.toString().trim()}`);
  });

  frontend.on('close', (code) => {
    console.log(`Frontend encerrado com código ${code}`);
  });

  // Tratamento de encerramento
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando sistema...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

}, 3000);

console.log('\n📊 Monitoramento:');
console.log('   Frontend: http://localhost:8080');
console.log('   Backend Health: http://localhost:3001/health');
console.log('   Backend API: http://localhost:3001/api');
console.log('\n🛑 Para parar: Ctrl+C\n');
