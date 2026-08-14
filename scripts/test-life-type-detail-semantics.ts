import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { getLifeType } from '../src/modules/species/species.service';
import { evaluateSpeciesForAquarium } from '../src/lib/speciesFitEngine';
import type { Aquarium, Fish } from '../src/types';

const routerSource = readFileSync(new URL('../src/components/SpeciesDetailDialog.tsx', import.meta.url), 'utf8');
const nonAnimalSource = readFileSync(new URL('../src/components/NonAnimalSpeciesDetailDialog.tsx', import.meta.url), 'utf8');

assert.match(routerSource, /lifeType === 'plant' \|\| lifeType === 'hardscape'/, 'species detail router must explicitly separate plant/hardscape from livestock detail');
assert.match(routerSource, /NonAnimalSpeciesDetailDialog/, 'plant/hardscape must use the non-livestock detail surface');
assert.match(nonAnimalSource, /evaluateSpeciesForAquarium/, 'non-livestock detail must consume the canonical species-fit evaluator');

for (const forbidden of [
  'tankSize',
  'housingMode',
  'evaluateTankCompatibility',
  'onAddToCalculator',
  'onRecordDeath',
  'Feeding at a glance',
  '喂养速览',
  'Compatibility',
  'sexIdentification',
]) {
  assert.equal(nonAnimalSource.includes(forbidden), false, `non-livestock detail must not expose livestock-only semantic: ${forbidden}`);
}

assert.match(nonAnimalSource, /Care at a glance/);
assert.match(nonAnimalSource, /养护速览/);
assert.match(nonAnimalSource, /Hardscape is not counted as livestock/);
assert.match(nonAnimalSource, /硬景不计入活体密度或混养关系/);

const plant = fishData.find(item => item.id === 'sp_0304');
const hardscape = fishData.find(item => item.id === 'sp_0343');
assert.ok(plant, 'plant fixture sp_0304 must exist');
assert.ok(hardscape, 'hardscape fixture sp_0343 must exist');
assert.equal(getLifeType(plant), 'plant');
assert.equal(getLifeType(hardscape), 'hardscape');

const dirtyPlant: Fish = {
  ...plant,
  tankSize: '至少 800 升',
  housingMode: '建议单养',
  temperament: 'Aggressive',
};
const dirtyHardscape: Fish = {
  ...hardscape,
  tankSize: '至少 800 升',
  housingMode: '建议单养',
  temperament: 'Aggressive',
};
const aquarium: Aquarium = {
  id: 'life-type-detail-test',
  name: '30L test tank',
  waterType: 'Freshwater',
  dimensions: { length: '40', width: '30', height: '30' },
  targetTemperature: '25',
  fishes: [],
  equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '水草灯' },
};

for (const item of [dirtyPlant, dirtyHardscape]) {
  const result = evaluateSpeciesForAquarium(item, aquarium, []);
  const types = new Set([
    ...result.hardBlocks,
    ...result.warnings,
    ...result.confirmations,
    ...result.matchedItems,
  ].map(entry => entry.type));
  for (const animalOnlyType of ['volume_too_small', 'volume_needs_adjustment', 'predation_risk', 'density_high', 'single_housing']) {
    assert.equal(types.has(animalOnlyType), false, `${item.name} must not receive ${animalOnlyType}`);
  }
}

console.log('life-type detail semantics passed: plant/hardscape route to non-livestock UI and canonical fit rules');
