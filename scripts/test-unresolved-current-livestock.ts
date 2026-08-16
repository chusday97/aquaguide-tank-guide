import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium } from '../src/types';
import {
  assessSpeciesAddition,
  preparePlannedAddition,
} from '../src/services/aquarium/species-addition.service';

const candidate = fishData.find(item => item.id === 'sp_0431') || fishData[0];
assert.ok(candidate, 'test requires at least one canonical catalog species');

const baseAquarium: Aquarium = {
  id: 'tank-unresolved-guard',
  name: 'Unresolved Guard Tank',
  fishes: [],
  dimensions: { length: '120', width: '45', height: '45' },
  waterType: 'Freshwater',
  targetTemperature: '24',
  substrate: '河沙',
  equipment: {
    filter: '桶滤',
    heater: true,
    oxygen: true,
    light: '普通灯',
  },
};

const unresolvedFishId = 'unresolved:golden-bristlenose:user-record';
const aquariumWithUnresolved: Aquarium = {
  ...baseAquarium,
  fishes: [{
    id: 'livestock-unresolved-1',
    fishId: unresolvedFishId,
    quantity: 2,
    entryDate: '2026-08-16T00:00:00.000Z',
  }],
};

const assessment = assessSpeciesAddition({
  aquarium: aquariumWithUnresolved,
  items: [{ fishId: candidate.id, quantity: 1 }],
  speciesCatalog: fishData,
});

assert.ok(assessment, 'known candidate should still be evaluated');
assert.ok(
  assessment.missingInformation.some(rule => (
    rule.code === 'unresolved_current_livestock'
    && rule.affectedSpeciesIds.includes(unresolvedFishId)
  )),
  'unresolved current livestock must be surfaced as missing evidence instead of ignored',
);
assert.ok(
  assessment.status === 'insufficient_data' || assessment.status === 'not_recommended',
  `unresolved current livestock must prevent compatible/caution final verdicts, got ${assessment.status}`,
);

const planned = preparePlannedAddition({
  aquarium: aquariumWithUnresolved,
  items: [{ fishId: candidate.id, quantity: 1 }],
  speciesCatalog: fishData,
});
assert.equal(
  planned.policy,
  assessment.status === 'not_recommended' ? 'block' : 'complete_information',
  'planned additions must not bypass unresolved current livestock',
);

const control = assessSpeciesAddition({
  aquarium: baseAquarium,
  items: [{ fishId: candidate.id, quantity: 1 }],
  speciesCatalog: fishData,
});
assert.ok(control, 'control candidate should be evaluated');
assert.equal(
  control.missingInformation.some(rule => rule.code === 'unresolved_current_livestock'),
  false,
  'resolved-only tanks must not receive the unresolved-livestock rule',
);

console.log('unresolved current livestock regression passed');
