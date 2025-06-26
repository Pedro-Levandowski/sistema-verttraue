
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Sistema vertttraue...\n');

// Iniciar backend
console.log('📡 Iniciando Backend...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Aguardar um pouco antes de iniciar o frontend
setTimeout(() => {
  console.log('🌐 Iniciando Frontend...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  // Tratar sinais de interrupção
  process.on('SIGINT', () => {
    console.log('\n🛑 Parando serviços...');
    backend.kill();
    frontend.kill();
    process.exit();
  });
}, 3000);
