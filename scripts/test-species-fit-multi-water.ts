import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateSpeciesForAquarium } from '../src/lib/speciesFitEngine';
import type { Aquarium } from '../src/types';

const makeTank = (waterType: Aquarium['waterType']): Aquarium => ({
  id: 'multi-water-test',
  name: 'Multi-water test',
  waterType,
  targetTemperature: '24',
  dimensions: { length: '90', width: '40', height: '40' },
  fishes: [],
} as Aquarium);

for (const id of ['sp_0436', 'sp_0475']) {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, id + ' must exist');

  const freshwater = evaluateSpeciesForAquarium(species, makeTank('Freshwater'));
  assert.equal(freshwater.hardBlocks.some(item => item.type === 'water_type_mismatch'), false, id + ' must allow reviewed freshwater');
  assert.equal(freshwater.confirmations.some(item => item.type === 'unknown_water_type'), false, id + ' must not degrade multi-water authority to unknown');
  assert.ok(freshwater.matchedItems.some(item => item.type === 'water_type'), id + ' must mark freshwater as matched');

  const saltwater = evaluateSpeciesForAquarium(species, makeTank('Saltwater'));
  assert.ok(saltwater.hardBlocks.some(item => item.type === 'water_type_mismatch'), id + ' must still reject saltwater');
}

console.log('Species-fit multi-water authority passed for guppy and high-body bitterling');
