import fs from 'node:fs';
import assert from 'node:assert/strict';

const hub = fs.readFileSync('src/pages/CollectionHub.tsx', 'utf8');
const collectionService = fs.readFileSync('src/services/collection/collection.service.ts', 'utf8');

assert.match(hub, /import \{ getCollectionSnapshot, hydrateCollectionData, subscribeToCollection \} from '\.\.\/services\/collection\/collection\.service';/);
assert.match(hub, /const \[snapshot, setSnapshot\] = useState\(getCollectionSnapshot\)/);
assert.match(hub, /const unsubscribe = subscribeToCollection\(\(\) => setSnapshot\(getCollectionSnapshot\(\)\)\);/);
assert.match(hub, /void hydrateCollectionData\(\)\s+\.then\(next => \{ if \(active\) setSnapshot\(next\); \}\)/s);
assert.match(hub, /return \(\) => \{\s+active = false;\s+unsubscribe\(\);\s+\};/s);

// The shared hydrator is the canonical cloud boundary for all three data-backed modules.
assert.match(collectionService, /const \[memorials, favorites\] = await Promise\.all\(\[/);
assert.match(collectionService, /repository\.getMemorialRecords\(\)/);
assert.match(collectionService, /repository\.getFavorites\(\)/);
assert.match(collectionService, /setSpeciesFavoriteIds\(favorites\.speciesCatalogKeys\)/);
assert.match(collectionService, /setCareFavorites\(Object\.fromEntries\(favorites\.careFavorites/);

console.log('collection hub hydration contract passed: direct hub entry refreshes canonical collection data while preserving local subscriptions');
