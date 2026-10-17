import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) => readFileSync(resolve(path), 'utf8');
const encyclopedia = read('src/pages/Encyclopedia.tsx');
const care = read('src/pages/CareEncyclopedia.tsx');
const collection = read('src/pages/Collection.tsx');
const hub = read('src/pages/CollectionHub.tsx');
const collectionService = read('src/services/collection/collection.service.ts');

for (const [name, source] of [
  ['Encyclopedia', encyclopedia],
  ['CareEncyclopedia', care],
  ['Collection', collection],
  ['CollectionHub', hub],
] as const) {
  assert.doesNotMatch(source, /setSpeciesFavoriteIds|toggleCareFavorite|getSpeciesFavoriteIds|getCareFavorites/, `${name} must not bypass the repository favorite boundary`);
}

assert.match(encyclopedia, /loadCurrentFavorites/);
assert.match(encyclopedia, /repository\.updateFavorite\(\{ type: 'species'/);
assert.match(care, /loadCurrentFavorites/);
assert.match(care, /repository\.updateFavorite\(\{ type: 'care'/);
assert.match(collection, /loadCurrentFavorites/);
assert.match(collection, /repository\.updateFavorite\(\{ type: 'species'/);
assert.match(collection, /repository\.updateFavorite\(\{ type: 'care'/);
assert.match(hub, /loadCurrentFavorites/);
assert.match(collectionService, /repository\.getFavorites\('species'\)/);
assert.match(collectionService, /repository\.getFavorites\('care'\)/);

console.log('collection favorite boundary verified: encyclopedia, care and collection surfaces read/write favorites through the current repository without page-level localStorage persistence');
