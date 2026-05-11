import { spawn } from 'node:child_process';

const port = process.argv[2] ?? '3000';

const child = spawn('ssh', ['-o', 'StrictHostKeyChecking=accept-new', '-R', `80:localhost:${port}`, 'nokey@localhost.run'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: false
});

function handleOutput(chunk) {
  const text = chunk.toString();
  process.stdout.write(text);

  const match = text.match(/https:\/\/[a-zA-Z0-9.-]+/);
  if (match) {
    console.log('\n=== COPY THIS URL TO WEB_APP_URL IN .env ===');
    console.log(match[0]);
    console.log('===========================================\n');
  }
}

child.stdout.on('data', handleOutput);
child.stderr.on('data', handleOutput);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
