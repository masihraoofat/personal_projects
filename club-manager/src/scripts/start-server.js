
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Compile TypeScript server files
console.log('Compiling server...');
const tsc = spawn('npx', ['tsc', '-p', join(__dirname, '..', 'server', 'tsconfig.json')], {
  stdio: 'inherit',
  shell: true
});

tsc.on('close', (code) => {
  if (code !== 0) {
    console.error(`tsc process exited with code ${code}`);
    return;
  }
  
  console.log('Server compiled successfully');
  
  // Start the server
  console.log('Starting server...');
  const server = spawn('node', [join(__dirname, '..', '..', 'dist', 'server', 'server', 'index.js')], {
    stdio: 'inherit',
    shell: true
  });
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
});
