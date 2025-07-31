// Test script for exact 88-degree solar arc calculation
const { spawn } = require('child_process');

console.log('Starting Next.js development server...');

const server = spawn('npm', ['run', 'dev'], {
  cwd: '/Users/bentyson/human/human-design-app',
  stdio: ['pipe', 'pipe', 'pipe']
});

server.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

server.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

// Wait for server to start, then make test request
setTimeout(() => {
  console.log('\nMaking test request...\n');
  
  const testRequest = spawn('curl', [
    '-X', 'POST',
    'http://localhost:3000/api/generate-chart',
    '-H', 'Content-Type: application/json',
    '-d', JSON.stringify({
      name: "Test Subject",
      birthDate: "1969-12-12", 
      birthTime: "22:12",
      birthPlace: "Fresno, CA, USA"
    })
  ]);
  
  testRequest.stdout.on('data', (data) => {
    const response = data.toString();
    console.log('API Response (first 300 chars):', response.substring(0, 300));
  });
  
  testRequest.on('exit', () => {
    console.log('\nTest request completed. Stopping server...');
    server.kill();
    process.exit(0);
  });
  
}, 3000);

server.on('exit', (code) => {
  console.log('Server exited with code:', code);
  process.exit(code);
});