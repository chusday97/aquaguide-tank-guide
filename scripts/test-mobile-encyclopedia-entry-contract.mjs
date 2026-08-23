import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/EncyclopediaBase.tsx', 'utf8');
const start = source.indexOf('atlas-mobile-toolbar');
const end = source.indexOf('{lastAddedToTankMessage', start);
assert.ok(start >= 0 && end > start, 'mobile encyclopedia toolbar source must be inspectable');
const mobileToolbar = source.slice(start, end);

assert.match(mobileToolbar, /data-atlas-mobile-search/, 'mobile encyclopedia toolbar must expose a first-class species search action');
assert.match(mobileToolbar, /getElementById\('atlas-toolbar'\)/, 'mobile search action must route directly to the existing canonical atlas search toolbar');
assert.doesNotMatch(mobileToolbar, /\/collection\/wishlist/, 'wishlist shortcut must not displace the primary species-search action in the mobile atlas toolbar');

console.log('Mobile Encyclopedia entry contract PASS: search is first-class; wishlist remains outside the core mobile atlas toolbar.');
