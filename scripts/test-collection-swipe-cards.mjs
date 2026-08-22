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
assert.ok(styles.includes('overflow-x: auto'), 'saved-object collection rails must be horizontally scrollable');
assert.ok(styles.includes('scroll-snap-type: x mandatory'), 'saved-object rails must snap card-by-card');
assert.ok(styles.includes('scroll-snap-align: start'), 'saved-object cards must expose snap positions');
assert.ok(styles.includes('min(82vw, 320px)'), 'phone wishlist cards must leave the next card peeking into view');
assert.ok(styles.includes('min(86vw, 360px)'), 'phone care cards must leave the next card peeking into view');
assert.equal(styles.includes('.collection-hub > section[aria-label]'), false, 'top-level collection hub must not regress to the old horizontal rail CSS');
assert.equal(styles.includes('.collection-memorial-grid,\n.collection-achievement-grid {\n  display: flex !important'), false, 'memorial and achievement modules must not be silently converted into favorites rails');

assert.ok(hub.includes('function CollectionCarousel'), 'collection hub must use an explicit focus carousel');
assert.ok(hub.includes('data-carousel-card'), 'carousel cards must expose a stable test hook');
assert.ok(hub.includes('data-carousel-active'), 'carousel must expose one explicit active card');
assert.ok(hub.includes('drag="x"'), 'carousel must support horizontal drag');
assert.ok(hub.includes('scale: isActive ? 1 : 0.86'), 'active and neighboring cards must have a visible scale hierarchy');
assert.ok(hub.includes("filter: isActive ? 'blur(0px)' : 'blur(2px)'"), 'neighboring cards must be visually de-emphasized');
assert.ok(hub.includes('useReducedMotion'), 'carousel animation must respect reduced-motion preference');
assert.ok(hub.includes("aria-current={index === activeIndex ? 'true' : undefined}"), 'carousel position indicator must expose the active item');
assert.ok(hub.includes("'上一个水族册模块'"), 'carousel previous control must have an accessible Chinese label');
assert.ok(hub.includes("'下一个水族册模块'"), 'carousel next control must have an accessible Chinese label');
assert.ok(hub.includes('左右滑动或点击箭头'), 'carousel must include a discoverability hint');

const liveCardCount = (hub.match(/<CollectionModuleCard/g) || []).length;
assert.equal(liveCardCount, 3, 'primary collection carousel must contain exactly three live modules');
assert.ok(hub.includes('data-collection-coming-soon'), 'building achievements must move to a separate coming-soon surface');
assert.ok(hub.includes('data-feature-status="building"'), 'coming-soon achievements must remain explicitly gated');
const comingSoonSection = hub.slice(hub.indexOf('data-collection-coming-soon'));
assert.equal(/<button/.test(comingSoonSection), false, 'building achievements must not expose a fake business CTA');

console.log('Collection interaction contract verified: three live focus-carousel modules, achievements outside primary IA, and saved-object rails preserved.');
