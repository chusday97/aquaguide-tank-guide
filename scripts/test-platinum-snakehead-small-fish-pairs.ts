import assert from 'node:assert/strict';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';
import { getReviewedPairRule } from '../src/data/compatibilityEvidence';

const smallFishIds = [
  'sp_0431', 'sp_0434', 'sp_0436', 'sp_0435', 'sp_0439', 'sp_0010',
  'sp_0011', 'sp_0437', 'sp_0012', 'sp_0468', 'sp_0443', 'sp_0013',
];

const unresolvedIds = [
  'sp_0438', 'sp_0451', 'sp_0021', 'sp_0459', 'sp_0001', 'sp_0002', 'sp_0428',
];

const fish = selectCompatibilityLaunchCohort();
const byId = new Map(fish.map(item => [item.id, item]));
const platinum = byId.get('sp_0224');
assert.ok(platinum, 'Platinum snakehead must be in launch cohort');

for (const id of smallFishIds) {
  const prey = byId.get(id);
  assert.ok(prey, id + ' must be in launch cohort');
  assert.equal(prey.size, 'Small', id + ' must remain catalog Small for this inference');

  const rule = getReviewedPairRule('sp_0224', id);
  assert.ok(rule, 'reviewed pair rule missing for ' + id);
  assert.equal(rule.verdict, 'not_recommended');
  assert.equal(rule.riskType, 'predation_threat');
  assert.equal(rule.basis, 'rule_inference');
  assert.equal(rule.confidence, 'medium');
  assert.deepEqual(rule.citations.map(source => source.id).sort(), [
    'northern-snakehead-fws-erss-2024',
    'northern-snakehead-usgs-diet-2012',
  ]);

  const result = evaluateSpeciesCombination([platinum, prey]);
  assert.equal(result.status, 'not_recommended', id + ' must resolve to not_recommended');
  assert.ok(result.blockingRules.some(item => item.code === 'reviewed_pair_rule' || item.code === 'pair_rule_predation_threat'));
}

for (const id of unresolvedIds) {
  const other = byId.get(id);
  assert.ok(other, id + ' must be in launch cohort');
  assert.equal(getReviewedPairRule('sp_0224', id), undefined, id + ' must not receive an inferred pair rule');
  const result = evaluateSpeciesCombination([platinum, other]);
  assert.equal(result.status, 'insufficient_data', id + ' must remain fail-closed');
}

console.log('Platinum snakehead pair scope passed: 12 small-fish pairs not recommended; 7 non-covered pairs remain insufficient');
