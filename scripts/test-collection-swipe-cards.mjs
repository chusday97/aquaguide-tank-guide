import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

const [styles, collection, hub] = await Promise.all([
  read('src/styles/typography-system.css'),
  read('src/pages/Collection.tsx'),
  read('src/pages/CollectionHub.tsx'),
]);

assert.ok(collection.includes('collection-wishlist-grid'), 'wishlist collection rail must remain addressable by a stable class');
assert.ok(collection.includes('collection-care-grid'), 'care collection rail must remain addressable by a stable class');
assert.ok(hub.includes('className="collection-hub'), 'collection hub must expose a stable root class');

assert.ok(styles.includes('.collection-wishlist-grid,\n.collection-care-grid'), 'wishlist and care collections must share a horizontal rail contract');
assert.ok(styles.includes('overflow-x: auto'), 'collection rails must be horizontally scrollable');
assert.ok(styles.includes('scroll-snap-type: x mandatory'), 'collection rails must snap card-by-card');
assert.ok(styles.includes('scroll-snap-align: start'), 'collection cards must expose snap positions');
assert.ok(styles.includes('min(82vw, 320px)'), 'phone wishlist cards must leave the next card peeking into view');
assert.ok(styles.includes('min(86vw, 360px)'), 'phone care cards must leave the next card peeking into view');
assert.ok(styles.includes('.collection-hub > section[aria-label]'), 'collection hub module cards must also form a swipeable rail');
assert.equal(styles.includes('.collection-memorial-grid,\n.collection-achievement-grid {\n  display: flex !important'), false, 'memorial and achievement modules must not be silently converted into favorites rails');

console.log('Collection swipe-card contract verified: hub, wishlist and care use horizontal snap rails while memorial remains independent.');
