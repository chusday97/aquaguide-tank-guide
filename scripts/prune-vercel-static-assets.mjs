import { readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const legacyRoots = [
  'species-transparent',
  'species-image-overrides',
  'species-display',
  'species-generated',
  'species-local',
  'species-white',
  'assets/qa',
];

const exists = async filePath => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const measure = async current => {
  const info = await stat(current);
  if (info.isFile()) return info.size;
  let total = 0;
  for (const name of await readdir(current)) total += await measure(path.join(current, name));
  return total;
};

if (!await exists(dist)) throw new Error('dist is missing; refusing to prune deployment assets');

let removedBytes = 0;
for (const rootName of legacyRoots) {
  const target = path.join(dist, rootName);
  if (!await exists(target)) continue;
  removedBytes += await measure(target);
  await rm(target, { recursive: true, force: true });
}

console.log(`Pruned legacy species source assets from deployment output: ${(removedBytes / 1024 / 1024).toFixed(1)} MB`);
