import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/components/SpeciesDetailDialog.tsx', 'utf8');

assert.doesNotMatch(
  source,
  /fish\.feedingProfile/,
  'SpeciesDetailDialog must not bypass the reviewed care presentation by reading fish.feedingProfile directly',
);
assert.match(
  source,
  /data-species-plant-care-summary/,
  'SpeciesDetailDialog must render a dedicated plant-care summary instead of an animal feeding card',
);
assert.match(
  source,
  /carePresentation\?\.environmentItems|carePresentation\.environmentItems/,
  'plant-care UI must consume structured carePresentation environment items',
);
assert.match(
  source,
  /data-species-feeding-summary/,
  'animal feeding summary must remain available after separating plant care',
);

console.log('Species detail care boundary: PASS (no direct feeding-profile bypass; plant and animal summaries separated).');
