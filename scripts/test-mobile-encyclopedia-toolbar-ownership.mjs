import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const encyclopedia = fs.readFileSync('src/pages/EncyclopediaBase.tsx', 'utf8');

assert.match(app, /isEncyclopediaWorkspace\s*=\s*location\.pathname\s*===\s*['"]\/encyclopedia['"]/,
  'mobile shell must explicitly recognize Encyclopedia-owned toolbar route');
assert.match(app, /!isAquariumWorkspace\s*&&\s*!isEncyclopediaWorkspace/,
  'global mobile header must not render behind the Encyclopedia-owned toolbar');
assert.match(encyclopedia, /data-atlas-mobile-search/,
  'Encyclopedia toolbar must own Search');
assert.match(encyclopedia, /data-atlas-mobile-identify/,
  'Encyclopedia toolbar must own Photo ID');
assert.match(encyclopedia, /data-atlas-mobile-settings/,
  'Encyclopedia toolbar must preserve Settings access when it owns the mobile top bar');

console.log('Mobile Encyclopedia toolbar ownership contract PASS');
