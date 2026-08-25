import assert from 'node:assert/strict';
import type { Aquarium } from '../src/types';
import { fishData } from '../src/data/fishData';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { recommendationService } from '../src/modules/recommendation/recommendation.service';

const existing = fishData.find(fish => fish.id === 'sp_0431');
const candidate = fishData.find(fish => fish.id === 'sp_0016');
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
assert.ok(
  ordinary.items.some(item => item.speciesId === candidate.id),
  'ordinary Recommendation must not silently drop a non-blocked single-housing candidate',
);

const smart = recommendationService.recommendSmartForAquarium({ aquarium: tank, speciesPool });
const smartCandidate = [...smart.direct, ...smart.adjustable, ...smart.blocked]
  .find(item => item.speciesId === candidate.id);
assert.ok(smartCandidate, 'Smart Recommendation must preserve the candidate after canonical evaluation');
assert.equal(
  smartCandidate.status,
  canonical.status === 'compatible' ? 'direct' : 'adjustable',
  'Smart Recommendation must not escalate a canonical warning/insufficient-data result into candidate suppression',
);


const cardinal = fishData.find(fish => fish.id === 'sp_0432');
const zebra = fishData.find(fish => fish.id === 'sp_0435');
assert.ok(cardinal, 'Cardinal tetra fixture must exist');
assert.ok(zebra, 'Zebra fixture must exist');

const nearLimitTank: Aquarium = {
  id: 'recommendation-near-limit-tank',
  name: 'near-limit recommendation tank',
  fishes: [{ id: 'stock-neon-15', fishId: existing.id, quantity: 15, entryDate: '2026-08-01' }],
  dimensions: { length: '60', width: '30', height: '30' },
  waterType: 'Freshwater',
  targetTemperature: '24',
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
};
const nearLimitCanonical = evaluateTankCompatibility({
  tank: nearLimitTank,
  existingSpecies: [{ species: existing, record: nearLimitTank.fishes[0] }],
  candidateSpecies: cardinal,
  candidateQuantity: 1,
});
assert.equal(nearLimitCanonical.blockingRules.length, 0, 'near-limit fixture must have no canonical block');
const nearLimitSmart = recommendationService.recommendSmartForAquarium({
  aquarium: nearLimitTank,
  speciesPool: [existing, cardinal],
});
const nearLimitCandidate = [...nearLimitSmart.direct, ...nearLimitSmart.adjustable, ...nearLimitSmart.blocked]
  .find(item => item.speciesId === cardinal.id);
assert.ok(nearLimitCandidate, 'near-limit candidate must remain representable');
assert.notEqual(
  nearLimitCandidate.status,
  'blocked',
  'heuristic load pressure must not hard-block a candidate without canonical blocking rules',
);

const groupGapTank: Aquarium = {
  id: 'recommendation-group-gap-tank',
  name: 'group-gap recommendation tank',
  fishes: [{ id: 'stock-zebra', fishId: zebra.id, quantity: 5, entryDate: '2026-08-01' }],
  dimensions: { length: '40', width: '25', height: '30' },
  waterType: 'Freshwater',
  targetTemperature: '24',
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
};
const groupGapCanonical = evaluateTankCompatibility({
  tank: groupGapTank,
  existingSpecies: [{ species: zebra, record: groupGapTank.fishes[0] }],
  candidateSpecies: existing,
  candidateQuantity: 4,
});
assert.equal(groupGapCanonical.blockingRules.length, 0, 'group-gap fixture must have no canonical block');
assert.ok(
  groupGapCanonical.warningRules.some(rule => rule.code === 'group_requirement_gap'),
  'group-gap fixture must carry the reviewed group warning',
);
const groupGapSmart = recommendationService.recommendSmartForAquarium({
  aquarium: groupGapTank,
  speciesPool: [zebra, existing],
});
const groupGapCandidate = [...groupGapSmart.direct, ...groupGapSmart.adjustable, ...groupGapSmart.blocked]
  .find(item => item.speciesId === existing.id);
assert.ok(groupGapCandidate, 'group-gap candidate must remain representable');
assert.notEqual(
  groupGapCandidate.status,
  'blocked',
  'reviewed group-size gap must remain an adjustment/warning unless canonical rules block it',
);
const loadBlockedTank: Aquarium = {
  id: 'recommendation-load-blocked-tank',
  name: 'load-blocked recommendation tank',
  fishes: [{ id: 'stock-neon-16', fishId: existing.id, quantity: 16, entryDate: '2026-08-01' }],
  dimensions: { length: '60', width: '30', height: '30' },
  waterType: 'Freshwater',
  targetTemperature: '26',
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
};
const loadBlockedCanonical = evaluateTankCompatibility({
  tank: loadBlockedTank,
  existingSpecies: [{ species: existing, record: loadBlockedTank.fishes[0] }],
  candidateSpecies: candidate,
  candidateQuantity: 1,
});
assert.equal(loadBlockedCanonical.blockingRules.length, 0, 'high-load fixture must have no canonical block');
const loadBlockedSmart = recommendationService.recommendSmartForAquarium({
  aquarium: loadBlockedTank,
  speciesPool: [existing, candidate],
});
const loadBlockedCandidate = [...loadBlockedSmart.direct, ...loadBlockedSmart.adjustable, ...loadBlockedSmart.blocked]
  .find(item => item.speciesId === candidate.id);
assert.ok(loadBlockedCandidate, 'high-load candidate must not disappear from Smart Recommendation');
assert.notEqual(
  loadBlockedCandidate.status,
  'blocked',
  'heuristic current-load threshold must not hard-block a candidate without canonical blocking rules',
);
assert.doesNotMatch(
  loadBlockedSmart.localSummary,
  /暂不建议继续增加生物/,
  'heuristic load pressure may warn but must not present a hard-stop summary without canonical blocking rules',
);

console.log('Recommendation authority contract PASS');
