import assert from 'node:assert/strict';
import type { Aquarium } from '../src/types';
import { fishData } from '../src/data/fishData';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { recommendationService } from '../src/modules/recommendation/recommendation.service';

const existing = fishData.find(fish => fish.id === 'sp_0431');
const candidate = fishData.find(fish => fish.id === 'sp_0021');
assert.ok(existing, '红绿灯 fixture must exist');
assert.ok(candidate, '金波子 fixture must exist');
assert.equal(candidate.housingMode, '建议单养', 'fixture must preserve the single-housing planning label');

const tank: Aquarium = {
  id: 'recommendation-authority-tank',
  name: '120L recommendation authority tank',
  fishes: [{ id: 'stock-neon', fishId: existing.id, quantity: 6, entryDate: '2026-08-01' }],
  dimensions: { length: '80', width: '40', height: '44' },
  waterType: 'Freshwater',
  targetTemperature: '26',
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
};

const speciesPool = [existing, candidate];
const canonical = evaluateTankCompatibility({
  tank,
  existingSpecies: [{ species: existing, record: tank.fishes[0] }],
  candidateSpecies: candidate,
  candidateQuantity: 1,
});

assert.notEqual(canonical.status, 'not_recommended', 'fixture must not have a canonical hard block');
assert.equal(canonical.blockingRules.length, 0, 'fixture must have no canonical blocking rules');

const ordinary = recommendationService.recommendForAquarium(tank, speciesPool, 10);
assert.ok(ordinary.items.some(item => item.speciesId === candidate.id), 'ordinary recommendation must preserve a non-blocked single-housing candidate');

const smart = recommendationService.recommendSmartForAquarium({ aquarium: tank, speciesPool });
const smartCandidate = [...smart.direct, ...smart.adjustable, ...smart.blocked].find(item => item.speciesId === candidate.id);
assert.ok(smartCandidate, 'smart recommendation must preserve the candidate after canonical evaluation');
assert.equal(smartCandidate.status, canonical.status === 'compatible' ? 'direct' : 'adjustable', 'smart recommendation must not escalate canonical warning/insufficient data into suppression');
assert.equal(smartCandidate.reason, canonical.summary, 'smart recommendation reason must use the canonical compatibility summary');

const nearLimitTank: Aquarium = {
  ...tank,
  id: 'recommendation-near-limit-tank',
  fishes: [{ id: 'stock-neon-40', fishId: existing.id, quantity: 40, entryDate: '2026-08-01' }],
};
const nearLimitSmart = recommendationService.recommendSmartForAquarium({ aquarium: nearLimitTank, speciesPool: [existing, candidate] });
const nearLimitCandidate = [...nearLimitSmart.direct, ...nearLimitSmart.adjustable, ...nearLimitSmart.blocked].find(item => item.speciesId === candidate.id);
assert.ok(nearLimitCandidate, 'near-limit candidate must remain representable');
assert.notEqual(nearLimitCandidate.status, 'blocked', 'heuristic load pressure must not hard-block without canonical blocking rules');
assert.doesNotMatch(nearLimitSmart.localSummary, /暂不建议继续增加生物/, 'heuristic load pressure must not present a hard-stop summary without canonical blocking rules');

console.log('Recommendation authority contract PASS');
