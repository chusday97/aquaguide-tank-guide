import assert from 'node:assert/strict';
import type { Fish } from '../src/types';
import { fishData } from '../src/data/fishData';
import { getSpeciesWaterType } from '../src/modules/species/species.service';
import { getSpeciesWaterEvidence } from '../src/modules/species/speciesWaterEvidence';

const hillstreamLoach = fishData.find(item => item.scientificName === 'Pseudogastromyzon fangi');
assert.ok(hillstreamLoach, 'missing Pseudogastromyzon fangi catalog fixture');
assert.equal(hillstreamLoach.category, '鱼类');
assert.match(hillstreamLoach.description, /蝴蝶鱼/);
assert.equal(
  getSpeciesWaterType(hillstreamLoach),
  'freshwater',
  'Pseudogastromyzon fangi is freshwater and must not become saltwater because its description contains the common-name token 蝴蝶鱼',
);
const hillstreamEvidence = getSpeciesWaterEvidence(hillstreamLoach);
assert.ok(hillstreamEvidence, 'Pseudogastromyzon fangi should have explicit audited freshwater evidence');
assert.equal(hillstreamEvidence.primaryWaterType, 'freshwater');

const ambiguousButterflyCommonName: Fish = {
  ...hillstreamLoach,
  id: 'eval-ambiguous-butterfly-common-name',
  scientificName: 'Syntheticus freshwater-test',
  name: '测试吸鳅',
  category: '鱼类',
  description: '淡水原生鱼，民间俗称蝴蝶鱼，需要高氧强流。',
};
assert.equal(
  getSpeciesWaterType(ambiguousButterflyCommonName),
  'freshwater',
  'bare 蝶鱼 substring inside 蝴蝶鱼 must not be a marine-certainty trigger',
);

const marineButterflyfish = fishData.find(item => item.scientificName === 'Chaetodon auriga');
assert.ok(marineButterflyfish, 'missing Chaetodon auriga marine control');
assert.equal(marineButterflyfish.category, '海水鱼');
assert.equal(
  getSpeciesWaterType(marineButterflyfish),
  'saltwater',
  'removing the ambiguous 蝶鱼 text trigger must not break explicit marine butterflyfish classification',
);

const smallMarineFish = fishData.find(item => (
  item.category === '海水鱼'
  && item.size === 'Small'
  && getSpeciesWaterType(item) === 'saltwater'
));
assert.ok(smallMarineFish, 'at least one explicit Small marine catalog fish must remain saltwater after the fix');

console.log(`species water ambiguity regression passed: hillstream=${hillstreamLoach.id}:freshwater; marine butterflyfish=${marineButterflyfish.id}:saltwater; small marine control=${smallMarineFish.id}`);
