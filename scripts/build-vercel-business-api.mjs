import { mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outfile = path.join(root, 'api/v1/business-app.bundle.mjs');

await mkdir(path.dirname(outfile), { recursive: true });
await rm(outfile, { force: true });
await build({
  entryPoints: [path.join(root, 'apps/api/src/business-app.ts')],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  packages: 'external',
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'info',
});
const { size } = await stat(outfile);
console.log(`Vercel Business API bundle: ${(size / 1024 / 1024).toFixed(2)} MB`);
