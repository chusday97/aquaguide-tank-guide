import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const collectionService = await readFile(new URL('../src/services/collection/collection.service.ts', import.meta.url), 'utf8');
const collectionPage = await readFile(new URL('../src/pages/Collection.tsx', import.meta.url), 'utf8');
const memorialDetail = await readFile(new URL('../src/pages/MemorialDetail.tsx', import.meta.url), 'utf8');

assert.match(collectionService, /export const hydrateCollectionMemorials = async/,
  'collection data layer must expose an explicit memorial hydration boundary');
assert.match(collectionService, /resolveRepositoryMode\(\)/,
  'memorial hydration must respect the active repository mode');
assert.match(collectionService, /repository\.getMemorialRecords\(\)/,
  'cloud collection hydration must read memorials from the repository');
assert.match(collectionService, /patchLocalAppState\(\{ deceasedRecords: memorials \}\)/,
  'remote memorials may update the compatibility cache only after the repository read succeeds');
assert.match(collectionPage, /hydrateCollectionMemorials\(\)/,
  'direct Collection entry must hydrate cloud memorials without requiring an Aquarium visit first');
assert.match(memorialDetail, /hydrateCollectionMemorials\(\)/,
  'direct MemorialDetail entry must hydrate cloud memorials without requiring an Aquarium visit first');
assert.match(memorialDetail, /isMemorialHydrating/,
  'MemorialDetail must distinguish remote hydration from a genuinely missing record');

console.log('collection memorial hydration contract passed');
