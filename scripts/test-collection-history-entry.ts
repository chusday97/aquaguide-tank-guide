import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) => readFileSync(resolve(path), 'utf8');
const app = read('src/App.tsx');
const hub = read('src/pages/CollectionHub.tsx');
const page = read('src/pages/CollectionHistory.tsx');

assert.match(app, /const loadCollectionHistory = \(\) => import\('\.\/pages\/CollectionHistory'\)/);
assert.match(app, /<Route path="\/collection\/history" element=\{page\(<CollectionHistory \/>, 'collection-history'\)\} \/>/);
assert.match(app, /path === '\/collection\/history'[\s\S]*?loadCollectionHistory/);
assert.match(hub, /data-collection-history-entry/);
assert.match(hub, /navigate\('\/collection\/history'\)/);
assert.match(page, /loadCurrentKeepingHistory\(\)/);
assert.match(page, /history\.activeCohorts/);
assert.match(page, /speciesEverKeptIds/);
assert.match(page, /history\.events/);
assert.doesNotMatch(page, /loadAppStateFromStorage|getSpeciesFavoriteIds|getCareFavorites|localStorage\./);

console.log('collection history entry verified: formal route and Hub entry render repository-backed current cohorts, ever-kept species and event timeline without bypassing the data boundary');
