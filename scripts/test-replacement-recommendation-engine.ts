import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium } from '../src/types';
import {
  deriveReplacementIntent,
  recommendReplacementSpecies,
} from '../src/lib/replacementRecommendationEngine';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing required catalog fixture ${id}`);
  return species;
};

const neon = byId('sp_0431');
const cardinal = byId('sp_0432');
const predator = byId('sp_0049');

const baseTank: Aquarium = {
  id: 'replacement-mvp-tank',
  name: 'Replacement MVP Tank',
  fishes: [],
  dimensions: { length: '120', width: '45', height: '45' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: {
    filter: '桶滤',
    heater: true,
    oxygen: true,
    light: '普通灯',
  },
};

const intent = deriveReplacementIntent(neon);
assert.equal(intent.lifeType, 'fish');
assert.equal(intent.waterType, 'freshwater');
assert.equal(intent.role, deriveReplacementIntent(cardinal).role, 'neon/cardinal should preserve the same ornamental role');
assert.equal(intent.socialMode, 'schooling');

const openTankResult = recommendReplacementSpecies({
  aquarium: baseTank,
  rejectedSpecies: neon,
  catalog: [neon, cardinal],
  candidateQuantity: 5,
});
assert.equal(openTankResult.evaluatedCandidateCount, 1);
assert.equal(openTankResult.status, 'alternatives_found');
assert.ok(
  [...openTankResult.recommended, ...openTankResult.conditional].some(item => item.species.id === cardinal.id),
  'same-role replacement should be surfaced when deterministic tank checks do not block it',
);
assert.equal(
  openTankResult.needsConfirmation.some(item => item.species.id === cardinal.id),
  false,
  'reviewed cardinal behavior evidence should not be demoted solely for missing profile coverage',
);

const predatorTank: Aquarium = {
  ...baseTank,
  fishes: [{
    id: 'predator-record',
    fishId: predator.id,
    quantity: 1,
    entryDate: '2026-08-16T00:00:00.000Z',
  }],
};
const predatorResult = recommendReplacementSpecies({
  aquarium: predatorTank,
  rejectedSpecies: neon,
  catalog: [predator, neon, cardinal],
  candidateQuantity: 5,
});
assert.equal(predatorResult.evaluatedCandidateCount, 1);
assert.equal(predatorResult.rejectedCandidateCount, 1);
assert.equal(predatorResult.status, 'no_safe_same_intent_alternative');
assert.equal(predatorResult.recommended.length, 0);
assert.equal(predatorResult.conditional.length, 0);
assert.equal(predatorResult.needsConfirmation.length, 0);

const unresolvedTank: Aquarium = {
  ...baseTank,
  fishes: [{
    id: 'unknown-current-record',
    fishId: 'unresolved:real-animal-not-in-catalog',
    quantity: 2,
    entryDate: '2026-08-16T00:00:00.000Z',
  }],
};
const unresolvedResult = recommendReplacementSpecies({
  aquarium: unresolvedTank,
  rejectedSpecies: neon,
  catalog: [neon, cardinal],
  candidateQuantity: 5,
});
assert.equal(unresolvedResult.status, 'insufficient_data');
assert.deepEqual(unresolvedResult.unresolvedCurrentSpeciesIds, ['unresolved:real-animal-not-in-catalog']);
assert.equal(unresolvedResult.recommended.length, 0, 'unknown current livestock must prevent formal replacement recommendations');
assert.equal(unresolvedResult.conditional.length, 0, 'unknown current livestock must prevent conditional promotion too');
assert.ok(unresolvedResult.needsConfirmation.some(item => item.species.id === cardinal.id));

const unrelated = {
  ...cardinal,
  id: 'synthetic-unrelated-replacement',
  name: '测试大型慈鲷',
  scientificName: 'Testus cichlidus',
  category: '慈鲷',
  description: '大型慈鲷测试记录',
  size: 'Large' as const,
};
const unrelatedResult = recommendReplacementSpecies({
  aquarium: baseTank,
  rejectedSpecies: neon,
  catalog: [neon, unrelated],
  candidateQuantity: 1,
});
assert.equal(unrelatedResult.evaluatedCandidateCount, 0, 'unrelated roles must not be inserted merely to fill recommendation slots');
assert.equal(unrelatedResult.status, 'no_safe_same_intent_alternative');

console.log('replacement recommendation MVP passed: intent is preserved, every candidate is re-evaluated, unresolved context fails closed, and zero alternatives is valid');
