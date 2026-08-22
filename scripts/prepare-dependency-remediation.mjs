#!/usr/bin/env node

import fs from 'node:fs';

const rootPath = 'package.json';
const apiPath = 'apps/api/package.json';

const root = JSON.parse(fs.readFileSync(rootPath, 'utf8'));
const api = JSON.parse(fs.readFileSync(apiPath, 'utf8'));

root.dependencies ??= {};
root.devDependencies ??= {};
api.dependencies ??= {};

const buildOnly = [
  '@tailwindcss/vite',
  '@types/three',
  '@vitejs/plugin-react',
  'shadcn',
  'vite',
];

for (const name of buildOnly) {
  const spec = root.dependencies[name] ?? root.devDependencies[name];
  if (!spec) {
    throw new Error(`Expected ${name} in root dependency metadata.`);
  }
  root.devDependencies[name] = spec;
  delete root.dependencies[name];
}

root.dependencies['react-router-dom'] = '^7.18.2';
root.dependencies.express = '^4.22.2';
api.dependencies.express = '^4.22.2';
root.devDependencies.vite = '^6.4.3';

function writeJson(path, value) {
  fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

writeJson(rootPath, root);
writeJson(apiPath, api);

console.log('Prepared dependency remediation candidate:');
console.log('- react-router-dom -> ^7.18.2');
console.log('- express -> ^4.22.2 (root + apps/api)');
console.log('- vite -> ^6.4.3 and devDependencies only');
console.log(`- build-only moved to devDependencies: ${buildOnly.join(', ')}`);
