import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Permanent regression for repository-mode-aware Data & backup semantics.
const root = new URL('../', import.meta.url);
const aquariumSource = await readFile(new URL('src/pages/Aquarium.tsx', root), 'utf8');

const importHandler = aquariumSource.match(/const handleImportLocalData = ([\s\S]*?)\n  };\n\n  const handleClearLocalData/);
assert.ok(importHandler, 'Data storage import handler must remain discoverable by the regression contract.');
assert.match(
  importHandler[1],
  /resolveRepositoryMode|repositoryMode/,
  'Data storage import must be repository-mode aware; cloud mode cannot silently import browser-only state and then report generic success.',
);

const clearHandler = aquariumSource.match(/const handleClearLocalData = ([\s\S]*?)\n  };\n\n  const activeAquarium/);
assert.ok(clearHandler, 'Data storage clear handler must remain discoverable by the regression contract.');
assert.match(
  clearHandler[1],
  /resolveRepositoryMode|repositoryMode/,
  'Data storage clear must be repository-mode aware; cloud mode cannot clear browser cache while promising that aquarium data is unrecoverable.',
);

assert.match(
  aquariumSource,
  /cloud[^\n]{0,120}(?:local|browser|本机|浏览器)|(?:local|browser|本机|浏览器)[^\n]{0,120}cloud/i,
  'The Data & backup surface must explicitly explain the cloud/local boundary instead of presenting a local-only storage promise in every repository mode.',
);

console.log('Data storage repository-mode contract: PASS');
