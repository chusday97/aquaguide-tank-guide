import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import {
  getReviewedCompatibilityProfileForFish,
  getReviewedPairRule,
} from '../src/data/compatibilityEvidence';
import {
  compatibilityRuleRequiresReviewedSource,
  type TankCompatibilityRule,
} from '../src/lib/tankCompatibilityEngine';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getLifeType } from '../src/modules/species/species.service';
import { getCompatibilityCoreFieldCoverageRow } from '../src/services/compatibility/compatibility-field-coverage.service';

const reviewedFish = fishData.filter(fish => (
  getLifeType(fish) === 'fish'
  && Boolean(getReviewedCompatibilityProfileForFish(fish))
));

const makeTank = (waterType: 'Freshwater' | 'Saltwater' = 'Freshwater', targetTemperature = '25') => ({
  id: 'runtime-provenance-audit',
  name: 'Runtime provenance audit',
  fishes: [],
  dimensions: { length: '300', width: '100', height: '80' },
  waterType,
  targetTemperature,
});

const reviewedCitationIds = (rule: TankCompatibilityRule) => {
  assert.ok(rule.citations.length > 0, `${rule.code} must retain reviewed source provenance`);
  assert.ok(
    rule.citations.every(citation => citation.reviewStatus === 'reviewed'),
    `${rule.code} must not expose draft/rejected citations`,
  );
  return rule.citations.map(citation => citation.id);
};

let pairCount = 0;
let auditedRuleCount = 0;
let compatibilityClearCount = 0;

for (let indexA = 0; indexA < reviewedFish.length; indexA += 1) {
  for (let indexB = indexA + 1; indexB < reviewedFish.length; indexB += 1) {
    const speciesA = reviewedFish[indexA];
    const speciesB = reviewedFish[indexB];
    const profileA = getReviewedCompatibilityProfileForFish(speciesA)!;
    const profileB = getReviewedCompatibilityProfileForFish(speciesB)!;
    const waterType = profileA.waterType === 'saltwater' && profileB.waterType === 'saltwater'
      ? 'Saltwater'
      : 'Freshwater';

    const decision = evaluateCompatibilityDecision({
      tank: makeTank(waterType),
      items: [
        { species: speciesA, quantity: Math.max(1, profileA.minimumGroupSize || 1), origin: 'existing' },
        { species: speciesB, quantity: Math.max(1, profileB.minimumGroupSize || 1), origin: 'candidate' },
      ],
    });
    pairCount += 1;

    for (const rule of [...decision.blockingRules, ...decision.warningRules]) {
      if (!compatibilityRuleRequiresReviewedSource(rule)) continue;
      auditedRuleCount += 1;
      reviewedCitationIds(rule);
    }

    for (const rule of decision.passedRules.filter(item => item.code === 'compatibility_clear')) {
      compatibilityClearCount += 1;
      reviewedCitationIds(rule);
    }
  }
}

assert.ok(auditedRuleCount > 0, 'runtime provenance audit must inspect user-impacting rules');
assert.ok(compatibilityClearCount > 0, 'runtime provenance audit must include positive compatibility conclusions');

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, `missing fixture fish ${id}`);
  return fish;
};

const blackSkirt = byId('sp_0010');
const yellowSnapper = byId('sp_0022');
const waterConflict = evaluateCompatibilityDecision({
  tank: makeTank('Freshwater'),
  items: [
    { species: blackSkirt, quantity: 12, origin: 'existing' },
    { species: yellowSnapper, quantity: 1, origin: 'candidate' },
  ],
});
const waterRule = waterConflict.blockingRules.find(rule => rule.code === 'water_type_conflict');
assert.ok(waterRule, 'freshwater + saltwater reviewed species must expose water-type conflict');
const expectedWaterSourceIds = new Set([
  ...getCompatibilityCoreFieldCoverageRow(blackSkirt).fields.water.evidenceIds,
  ...getCompatibilityCoreFieldCoverageRow(yellowSnapper).fields.water.evidenceIds,
]);
assert.deepEqual(
  new Set(reviewedCitationIds(waterRule)),
  expectedWaterSourceIds,
  'water-type conflict must cite water-field evidence rather than unrelated profile sources',
);

const blackSkirtCherry = evaluateCompatibilityDecision({
  tank: makeTank('Freshwater', '24'),
  items: [
    { species: blackSkirt, quantity: 12, origin: 'existing' },
    { species: byId('sp_0012'), quantity: 6, origin: 'candidate' },
  ],
});
assert.equal(blackSkirtCherry.status, 'compatible');
const clearRule = blackSkirtCherry.passedRules.find(rule => rule.code === 'compatibility_clear');
assert.ok(clearRule, 'compatible reviewed pair must expose compatibility_clear provenance');
reviewedCitationIds(clearRule);

const tigerBarb = byId('sp_0439');
const guppy = byId('sp_0436');
const directPair = getReviewedPairRule(tigerBarb.id, guppy.id);
assert.ok(directPair, 'tiger-barb × guppy direct reviewed pair fixture must exist');
const tigerGuppy = evaluateCompatibilityDecision({
  tank: makeTank('Freshwater'),
  items: [
    { species: tigerBarb, quantity: 8, origin: 'existing' },
    { species: guppy, quantity: 6, origin: 'candidate' },
  ],
});
const genericPairRule = tigerGuppy.warningRules.find(rule => rule.code === 'reviewed_pair_rule');
assert.ok(genericPairRule, 'canonical reviewed_pair_rule must remain visible for direct reviewed pair authority');
assert.deepEqual(
  new Set(reviewedCitationIds(genericPairRule)),
  new Set(directPair.citations.map(citation => citation.id)),
  'generic reviewed_pair_rule must inherit only direct pair citations, not generic species-profile citations',
);

console.log(
  `Compatibility runtime provenance PASS: ${reviewedFish.length} reviewed fish, ${pairCount} pairs, ${auditedRuleCount} source-required risk rules, and ${compatibilityClearCount} positive conclusions all retain reviewed citations with field-specific/direct-pair provenance.`,
);
