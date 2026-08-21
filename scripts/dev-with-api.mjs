import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), '..');
const binDir = path.join(rootDir, 'node_modules', '.bin');
const viteBin = path.join(binDir, process.platform === 'win32' ? 'vite.cmd' : 'vite');
const tsxBin = path.join(binDir, process.platform === 'win32' ? 'tsx.cmd' : 'tsx');

const children = [];
const apiPort = process.env.API_PORT || '8787';

const waitForApi = async () => {
  const healthUrl = `http://127.0.0.1:${apiPort}/api/health`;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) return;
    } catch {
      // The API process is still starting. The next bounded retry is intentional.
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`API health check did not become ready: ${healthUrl}`);
};

const stopAll = () => {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
};

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});

const observeChild = (child) => {
  child.on('exit', code => {
    if (code && code !== 0) {
      stopAll();
      process.exit(code);
    }
  });
};

const start = async () => {
  const api = spawn(tsxBin, ['apps/api/src/index.ts'], {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, API_PORT: apiPort },
  });
  children.push(api);
  observeChild(api);
  await waitForApi();
  console.log(`AquaGuide API ready: http://127.0.0.1:${apiPort}/api/health`);

  const vite = spawn(viteBin, ['--port=3000', '--host=0.0.0.0'], {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  });
  children.push(vite);
  observeChild(vite);
};

void start().catch(error => {
  console.error(error.message);
  stopAll();
  process.exit(1);
});
