import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import type { Aquarium, Fish } from '../src/types';

const tank: Aquarium = {
  id: 'compatibility-evidence-coverage',
  name: 'Compatibility evidence coverage',
  fishes: [],
  dimensions: { length: '60', width: '40', height: '40' },
  waterType: 'Freshwater',
  targetTemperature: '24',
  substrate: '水草泥',
  plants: [],
  hardscape: [],
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
};

const byId = (id: string): Fish => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, `species ${id} must exist in the catalog`);
  return fish;
};

const evaluatePair = (existingId: string, candidateId: string, aquarium: Aquarium = tank) => {
  const existing = byId(existingId);
  const candidate = byId(candidateId);
  const decision = evaluateCompatibilityDecision({
    tank: aquarium,
    items: [
      { species: existing, quantity: existingId === 'sp_0431' ? 6 : 2, origin: 'existing' },
      { species: candidate, quantity: candidateId === 'sp_0432' ? 6 : 1, origin: 'candidate' },
    ],
  });
  const pair = decision.pairResults[0];
  assert.ok(pair, `${existing.name} → ${candidate.name} must produce a pair result`);
  return pair;
};

const evidenceAudit = getCompatibilityEvidenceAudit();
assert.ok(fishData.length >= 501, 'catalog size unexpectedly shrank below the evidence baseline');
assert.ok(evidenceAudit.reviewedSpeciesIds.length >= 7, 'reviewed species coverage regressed below the current baseline');
assert.ok(evidenceAudit.reviewedPairRules.length >= 4, 'reviewed pair-rule coverage regressed below the current baseline');
assert.ok(evidenceAudit.reviewedPairRules.every(rule => (
  rule.reviewStatus === 'reviewed' && rule.citations.length > 0
)), 'reviewed pair rules must retain reviewed citations');
assert.ok(evidenceAudit.reviewedSpeciesIds.every(id => getReviewedCompatibilityProfile(id)?.reviewStatus === 'reviewed'), 'reviewed profile getter must never expose non-reviewed evidence');

const tetraPair = evaluatePair('sp_0431', 'sp_0432');
assert.equal(tetraPair.status, 'caution', 'the explicitly reviewed tetra pair remains conditionally recordable');
assert.equal(tetraPair.rawResult.blockingRules.some(rule => rule.code === 'predation_risk'), false);

const guppyNeon = evaluatePair('sp_0436', 'sp_0431');
assert.equal(guppyNeon.status, 'insufficient_data', 'reviewed species without a reviewed pair rule must fail closed');
assert.ok(
  guppyNeon.rawResult.missingData.some(rule => rule.code === 'pair_evidence_unreviewed' && rule.severity === 'medium'),
  'missing pair evidence must be visible for guppy → neon',
);

const alteredTank: Aquarium = {
  ...tank,
  dimensions: { length: '10', width: '10', height: '10' },
  waterType: 'Saltwater',
  targetTemperature: undefined,
  equipment: { filter: '无', heater: false, oxygen: false, light: '无' },
};
const guppyNeonInAlteredTank = evaluatePair('sp_0436', 'sp_0431', alteredTank);
assert.equal(guppyNeonInAlteredTank.status, guppyNeon.status, 'species-only pair status must not depend on tank dimensions, water type, or equipment');
assert.deepEqual(
  guppyNeonInAlteredTank.rawResult.missingData.map(rule => rule.code).sort(),
  guppyNeon.rawResult.missingData.map(rule => rule.code).sort(),
  'species-only pair evidence gaps must be stable across tank configurations',
);

const overloadedTank: Aquarium = {
  ...tank,
  dimensions: { length: '20', width: '20', height: '20' },
};
const overloadedDecision = evaluateCompatibilityDecision({
  tank: overloadedTank,
  items: [
    { species: byId('sp_0431'), quantity: 50, origin: 'existing' },
    { species: byId('sp_0432'), quantity: 50, origin: 'candidate' },
  ],
});
assert.equal(overloadedDecision.status, 'not_recommended', 'tank aggregate must retain hard volume/load blocks alongside species-only pair results');
assert.ok(
  overloadedDecision.blockingRules.some(rule => ['volume_too_small', 'bioload_over_limit'].includes(rule.code)),
  'overloaded tank must expose a tank-level volume or bioload block',
);

const oscarZebrafish = evaluatePair('sp_0451', 'sp_0435');
assert.equal(oscarZebrafish.status, 'not_recommended', 'reviewed predator–prey evidence must block Oscar + zebrafish');
const oscarPairRule = oscarZebrafish.rawResult.blockingRules.find(rule => rule.code === 'pair_rule_predation_threat');
assert.ok(oscarPairRule, 'Oscar + zebrafish must expose the reviewed pair-level rule');
assert.equal(oscarPairRule.basis, 'pair_rule');
assert.equal(oscarPairRule.reviewStatus, 'reviewed');
assert.ok(oscarPairRule.citations.length >= 2);

const channaRhodeus = evaluatePair('sp_0224', 'sp_0475');
assert.equal(channaRhodeus.status, 'not_recommended', 'reviewed Channa–Rhodeus evidence must block the pair');
const channaPairRule = channaRhodeus.rawResult.blockingRules.find(rule => rule.code === 'pair_rule_predation_threat');
assert.ok(channaPairRule, 'Channa + Rhodeus must expose the reviewed pair-level rule');
assert.equal(channaPairRule.basis, 'pair_rule');
assert.equal(channaPairRule.reviewStatus, 'reviewed');
assert.ok(channaPairRule.citations.length >= 2);

const reviewedPriorityIds = ['sp_0431', 'sp_0432', 'sp_0434', 'sp_0436'];
assert.ok(reviewedPriorityIds.every(id => getReviewedCompatibilityProfile(id)), 'priority species must keep reviewed profiles');

console.log(`Compatibility evidence coverage PASS: ${fishData.length} catalog species, ${evidenceAudit.reviewedSpeciesIds.length} reviewed profiles, ${evidenceAudit.reviewedPairRules.length} reviewed pair rules.`);
console.log('Pair evidence boundary PASS: unreviewed reviewed-profile pairs remain insufficient_data while explicit pair rules retain their authority.');
