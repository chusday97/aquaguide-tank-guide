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
assert.equal(styles.includes('.collection-memorial-grid,\n.collection-achievement-grid {\n  display: flex !important'), false, 'memorial and achievement modules must not be silently converted into favorites rails');

assert.ok(hub.includes('function CollectionCarousel'), 'collection hub must use a dedicated focus carousel');
assert.ok(hub.includes('data-carousel-card'), 'collection carousel cards must expose a stable test target');
assert.ok(hub.includes('data-carousel-active'), 'collection carousel must expose the active-card state');
assert.ok(hub.includes('drag="x"'), 'collection carousel must support horizontal drag gestures');
assert.ok(hub.includes("scale: isActive ? 1 : 0.86"), 'active collection module must be visually emphasized over side cards');
assert.ok(hub.includes("filter: isActive ? 'blur(0px)' : 'blur(2px)'"), 'side collection modules must be visually de-emphasized');
assert.ok(hub.includes("aria-label={isEn ? 'Previous collection module' : '上一个水族册模块'}"), 'collection carousel must provide an accessible previous control');
assert.ok(hub.includes("aria-label={isEn ? 'Next collection module' : '下一个水族册模块'}"), 'collection carousel must provide an accessible next control');
assert.ok(hub.includes("aria-current={index === activeIndex ? 'true' : undefined}"), 'collection carousel indicators must expose current position');
assert.ok(hub.includes("左右滑动或点击箭头，浏览你的水族册。"), 'collection hub must make swipe discoverability explicit');

console.log('Collection interaction contract verified: detail rails keep scroll-snap while the collection hub uses an IceGlide-style focus carousel.');
