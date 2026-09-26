import assert from 'node:assert/strict';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';
import { getReviewedPairRule } from '../src/data/compatibilityEvidence';

const fish = selectCompatibilityLaunchCohort();
const byId = new Map(fish.map(item => [item.id, item]));
const platinum = byId.get('sp_0224');
assert.ok(platinum);

for (const id of ['sp_0438', 'sp_0021', 'sp_0459', 'sp_0001']) {
  const other = byId.get(id);
  assert.ok(other, id);
  const rule = getReviewedPairRule('sp_0224', id);
  assert.ok(rule, 'missing reviewed pair rule for ' + id);
  assert.equal(rule.verdict, 'not_recommended');
  assert.equal(rule.basis, 'rule_inference');
  const result = evaluateSpeciesCombination([platinum, other]);
  assert.equal(result.status, 'not_recommended', id + ' must resolve to not_recommended');
}

for (const id of ['sp_0451', 'sp_0002', 'sp_0428']) {
  const other = byId.get(id);
  assert.ok(other, id);
  assert.equal(getReviewedPairRule('sp_0224', id), undefined, id + ' must remain without direct pair rule');
  const result = evaluateSpeciesCombination([platinum, other]);
  assert.equal(result.status, 'insufficient_data', id + ' must remain fail-closed');
}

console.log('Platinum snakehead remaining-pair scope passed: 4 resolved, 3 remain fail-closed');
