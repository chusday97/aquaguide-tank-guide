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
assert.match(
  source,
  /\{getLifeType\(fish\) !== 'plant' && \(\s*<section[\s\S]{0,700}?data-species-environment-summary/,
  'legacy fish environment summary must be hidden for plants so reviewed plant care remains the only visible plant fact source',
);
assert.match(
  source,
  /const isPlant = Boolean\(fish && getLifeType\(fish\) === 'plant'\)/,
  'SpeciesDetailDialog must have one explicit plant boundary instead of repeated implicit category guesses',
);
assert.match(
  source,
  /if \(isPlant\) return isEn \? 'View plant care' : '查看植物养护'/,
  'plant footer action must describe plant care rather than add-to-tank or fish compatibility actions',
);
assert.match(
  source,
  /if \(isPlant\) \{[\s\S]{0,500}?careSectionButtonRef\.current\?\.scrollIntoView/,
  'plant primary action must return users to the reviewed plant-care surface',
);
assert.match(
  source,
  /\{!isPlant && \(\s*<div data-visual-result-status/,
  'fish-fit verdict must be hidden for plants until a reviewed plant-to-tank adapter exists',
);
assert.match(
  source,
  /\{!isPlant && onRecordDeath && \(/,
  'animal exit/death recording must not appear on plant details',
);
assert.match(
  source,
  /\{!isPlant && \(\s*<section className="overflow-hidden rounded-\[18px\] border border-border bg-white">\s*<button[\s\S]{0,500}?aria-expanded=\{expandedSection === 'compatibility'\}/,
  'fish compatibility accordion must be hidden for plants',
);
assert.match(
  source,
  /\{!isPlant && sexIdentificationGuide && \(/,
  'animal sex-identification content must not appear on plant details',
);

console.log('Species detail care boundary: PASS (reviewed plant care is isolated from legacy feeding, fish-fit and animal-only surfaces).');
