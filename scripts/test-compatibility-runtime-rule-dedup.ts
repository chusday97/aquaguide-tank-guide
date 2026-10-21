import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import {
  getReviewedCompatibilityProfileForFish,
  getReviewedPairRule,
} from '../src/data/compatibilityEvidence';
import {
  getCompatibilityRuleSemanticKey,
} from '../src/lib/compatibility/rule-semantics';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getLifeType } from '../src/modules/species/species.service';

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, `missing fixture fish ${id}`);
  return fish;
};

const tank = (
  length = 300,
  width = 100,
  height = 80,
  temperature = 25,
  waterType: 'Freshwater' | 'Saltwater' = 'Freshwater',
) => ({
  id: 'runtime-rule-dedup',
  name: 'Runtime rule dedupe',
  fishes: [],
  dimensions: {
    length: String(length),
    width: String(width),
    height: String(height),
  },
  waterType,
  targetTemperature: String(temperature),
});

const scopeKey = (ids: string[]) => [...new Set(ids)].sort().join('|');
const semanticInstanceKey = (rule: {
  code: string;
  affectedSpeciesIds: string[];
}) => `${getCompatibilityRuleSemanticKey(rule.code)}::${scopeKey(rule.affectedSpeciesIds || [])}`;

const reviewedFish = fishData.filter(fish => (
  getLifeType(fish) === 'fish'
  && Boolean(getReviewedCompatibilityProfileForFish(fish))
));

let pairCount = 0;
let auditedRuleCount = 0;

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
      tank: tank(300, 100, 80, 25, waterType),
      items: [
        {
          species: speciesA,
          quantity: Math.max(1, profileA.minimumGroupSize || 1),
          origin: 'existing',
        },
        {
          species: speciesB,
          quantity: Math.max(1, profileB.minimumGroupSize || 1),
          origin: 'candidate',
        },
      ],
    });
    pairCount += 1;

    for (const [bucket, rules] of [
      ['blocking', decision.blockingRules],
      ['warning', decision.warningRules],
    ] as const) {
      const seen = new Map<string, string>();
      for (const rule of rules) {
        auditedRuleCount += 1;
        const key = semanticInstanceKey(rule);
        const previous = seen.get(key);
        assert.equal(
          previous,
          undefined,
          `${speciesA.id} × ${speciesB.id} ${bucket} duplicates semantic instance ${key}: ${previous} + ${rule.code}`,
        );
        seen.set(key, rule.code);
      }
    }
  }
}

assert.equal(pairCount, 11026, 'reviewed-fish pair audit size changed; review the coverage change');
assert.ok(auditedRuleCount > 0, 'semantic rule audit must inspect runtime risk rules');

const tigerBarb = byId('sp_0439');
const miniParrot = byId('sp_0021');
const compoundPairAuthority = getReviewedPairRule(tigerBarb.id, miniParrot.id);
assert.ok(compoundPairAuthority, 'tiger-barb × mini-parrot reviewed pair authority must exist');

const compoundDecision = evaluateCompatibilityDecision({
  tank: tank(120, 45, 45, 25),
  items: [
    { species: miniParrot, quantity: 1, origin: 'existing' },
    { species: tigerBarb, quantity: 8, origin: 'candidate' },
  ],
});
const compoundRule = compoundDecision.blockingRules.find(
  rule => rule.code === 'pair_rule_behavior_and_territory_conflict',
);
assert.ok(compoundRule, 'concrete compound behavior/territory pair rule must survive aggregation');
assert.deepEqual(
  new Set(compoundRule.citations.map(citation => citation.id)),
  new Set(compoundPairAuthority.citations.map(citation => citation.id)),
  'concrete pair rule must retain only its reviewed direct-pair citations',
);
assert.equal(
  compoundDecision.blockingRules.filter(rule => (
    getCompatibilityRuleSemanticKey(rule.code) === 'territory:conflict'
    && scopeKey(rule.affectedSpeciesIds) === scopeKey([tigerBarb.id, miniParrot.id])
  )).length,
  1,
  'compound pair must expose one territory-conflict semantic instance for the exact pair',
);
assert.equal(
  [...compoundDecision.blockingRules, ...compoundDecision.warningRules]
    .some(rule => rule.code === 'reviewed_pair_rule'),
  false,
  'generic reviewed_pair_rule must not duplicate concrete reviewed pair authority',
);

const denison = byId('sp_0440');
const denisonProfile = getReviewedCompatibilityProfileForFish(denison);
assert.ok(denisonProfile);
const spaceDecision = evaluateCompatibilityDecision({
  tank: tank(100, 40, 40, 24),
  items: [
    {
      species: denison,
      quantity: Math.max(6, denisonProfile.minimumGroupSize || 1),
      origin: 'candidate',
    },
  ],
});
const spaceRules = [...spaceDecision.blockingRules, ...spaceDecision.warningRules];
const spaceKeys = new Set(spaceRules.map(rule => getCompatibilityRuleSemanticKey(rule.code)));
assert.ok(spaceKeys.has('space:length'), 'long-tank requirement must survive semantic dedupe');
assert.ok(spaceKeys.has('space:volume'), 'minimum-volume requirement must survive semantic dedupe');
assert.ok(
  spaceRules.some(rule => getCompatibilityRuleSemanticKey(rule.code) === 'space:length' && /120/.test(rule.evidence)),
  'length rule must retain the reviewed 120cm threshold',
);
assert.ok(
  spaceRules.some(rule => getCompatibilityRuleSemanticKey(rule.code) === 'space:volume' && /243/.test(rule.evidence)),
  'volume rule must retain the reviewed 243L threshold',
);

const existing = byId('sp_0015');
const candidateA = byId('sp_0011');
const candidateB = byId('sp_0118');
const emergentDecision = evaluateCompatibilityDecision({
  tank: tank(500, 200, 100, 25),
  items: [
    { species: existing, quantity: 10, origin: 'existing' },
    { species: candidateA, quantity: 10, origin: 'candidate' },
    { species: candidateB, quantity: 10, origin: 'candidate' },
  ],
});
const predationThreats = emergentDecision.blockingRules.filter(
  rule => getCompatibilityRuleSemanticKey(rule.code) === 'predation:threat',
);
assert.ok(predationThreats.length >= 1, 'emergent candidate conflict must retain predation authority');
assert.ok(
  predationThreats.some(rule => scopeKey(rule.affectedSpeciesIds) === scopeKey([candidateA.id, candidateB.id])),
  'candidate-to-candidate predation must retain the exact conflicting pair scope',
);
assert.equal(
  predationThreats.some(rule => rule.affectedSpeciesIds.length > 2),
  false,
  'pairwise predation must not be promoted into an all-tank affected scope',
);
assert.equal(
  predationThreats.some(rule => rule.affectedSpeciesIds.includes(existing.id)),
  false,
  'unrelated existing fish must not be added to the emergent candidate predation target',
);

console.log(
  `Compatibility runtime rule dedupe PASS: ${reviewedFish.length} reviewed fish, ${pairCount} pairs, ${auditedRuleCount} blocking/warning rules have zero duplicate semantic+scope instances; direct-pair, dual-space-threshold, and multi-pair action scopes remain precise.`,
);
