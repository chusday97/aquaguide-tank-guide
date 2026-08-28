import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const sourcePath = path.join(repoRoot, 'src/data/fishData.ts');
const outputPath = path.join(here, '../src/catalog.generated.json');

let sourceAvailable = true;
try {
  await access(sourcePath);
} catch {
  sourceAvailable = false;
}

if (!sourceAvailable) {
  const existing = JSON.parse(await readFile(outputPath, 'utf8'));
  if (!Array.isArray(existing) || existing.length === 0) {
    throw new Error('Repository catalog source is unavailable and generated catalog is invalid.');
  }
  console.log(`Using committed Admin species catalog: ${existing.length} entries`);
  process.exit(0);
}

const source = await readFile(sourcePath, 'utf8');
const match = source.match(/export const fishData: Fish\[\] = ([\s\S]*);\s*$/);
if (!match) throw new Error('Unable to locate fishData catalog payload.');

const fishData = JSON.parse(match[1]);
const catalog = fishData.map((item) => ({
  id: item.id,
  catalog_key: item.id,
  name: item.name,
  scientific_name: item.scientificName,
  category: item.category,
  status: 'catalog',
  image: item.image,
}));

await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(`Generated Admin species catalog: ${catalog.length} entries`);
