import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');

assert.match(source, /deriveWaterChangeDecision\(/, 'Aquarium must consume the Water Change decision adapter.');
assert.doesNotMatch(
  source,
  /else if \(!waterChangedToday && isChangeOverdue\)[\s\S]{0,500}?priority: 'high'/,
  'AQ-WATER-004: calendar overdue alone must not create a high-priority Today Action.',
);
assert.doesNotMatch(
  source,
  /Math\.min\(\.\.\.currentFishesDetails\.map\(f => f\.waterChangeCycle\)\) : 7/,
  'AQ-WATER-002: Aquarium must not own shortest-cycle/default-7 decision authority.',
);
assert.doesNotMatch(
  source,
  /healthScore < 85 \|\| isChangeOverdue/,
  'AQ-WATER-002: calendar overdue alone must not route users into water-quality diagnosis.',
);

console.log('P0 Water Change Authority contract: PASS');
