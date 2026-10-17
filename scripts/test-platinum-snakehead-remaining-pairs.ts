import assert from 'node:assert/strict';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';
import { getReviewedPairRule } from '../src/data/compatibilityEvidence';
import { getCompatibilityPairEvidenceCeiling } from '../src/data/compatibilityPairEvidenceCeilings';

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

for (const [id, decisionImpact, expectedStatus, domainCode] of [
  ['sp_0002', 'identity_critical', 'insufficient_data', 'pair_identity_evidence_ceiling'],
  ['sp_0428', 'identity_critical', 'insufficient_data', 'pair_identity_evidence_ceiling'],
  ['sp_0451', 'risk_management', 'caution', 'pair_risk_evidence_ceiling'],
] as const) {
  const other = byId.get(id);
  assert.ok(other, id);
  assert.equal(getReviewedPairRule('sp_0224', id), undefined, id + ' must remain without an inferred hard pair rule');
  assert.equal(getCompatibilityPairEvidenceCeiling('sp_0224', id)?.decisionImpact, decisionImpact);
  const result = evaluateSpeciesCombination([platinum, other]);
  assert.equal(result.status, expectedStatus, id + ' must follow its reviewed pair-evidence impact');
  assert.ok(result.metadata.domainRuleCodes.includes(domainCode));
}

console.log('Platinum snakehead remaining-pair scope passed: 4 resolved hard blocks, 2 identity-critical unknowns, 1 conservative evidence-window caution.');
