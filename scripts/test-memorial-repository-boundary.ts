import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const repositoryContract = await readFile(new URL('../src/services/repository/aquaguide.repository.ts', import.meta.url), 'utf8');
const localRepository = await readFile(new URL('../src/services/repository/local-aquaguide.repository.ts', import.meta.url), 'utf8');
const apiRepository = await readFile(new URL('../src/services/repository/api-aquaguide.repository.ts', import.meta.url), 'utf8');
const aquariumSource = await readFile(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');

assert.match(repositoryContract, /getMemorialRecords\(\): Promise<DeceasedRecord\[\]>/,
  'repository contract must expose memorial reads');
assert.match(localRepository, /async getMemorialRecords\(\)[\s\S]*deceasedRecords/,
  'local repository must read memorial records from the compatibility store');
assert.match(apiRepository, /async getMemorialRecords\(\)[\s\S]*\/memorial-records\?limit=100/,
  'cloud repository must fetch memorial history from the API');
assert.match(apiRepository, /toMemorialRecord/,
  'cloud memorial payloads must be normalized through a dedicated mapper');
assert.match(aquariumSource, /repository\.getMemorialRecords\(\)/,
  'Aquarium hydration must load memorial records through the repository');
assert.match(aquariumSource, /setDeceasedRecords\(repositoryMemorials\)/,
  'remote memorial history must become the in-memory source of truth');
assert.match(aquariumSource, /patchLocalAppState\(\{ deceasedRecords: repositoryMemorials \}\)/,
  'cloud memorial history may mirror to local storage only after remote read succeeds');

console.log('memorial repository boundary contract passed');
