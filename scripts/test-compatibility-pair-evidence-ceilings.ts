import assert from 'node:assert/strict';
import { compatibilityPairEvidenceCeilings, getCompatibilityPairEvidenceCeiling } from '../src/data/compatibilityPairEvidenceCeilings';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';

assert.equal(compatibilityPairEvidenceCeilings.length, 3);

const expected = new Map([
  [['sp_0002', 'sp_0224'].sort().join('::'), { code: 'prey_trade_identity_not_resolved', decisionImpact: 'identity_critical', status: 'insufficient_data', domainCode: 'pair_identity_evidence_ceiling' }],
  [['sp_0224', 'sp_0428'].sort().join('::'), { code: 'gastropod_predation_not_established', decisionImpact: 'identity_critical', status: 'insufficient_data', domainCode: 'pair_identity_evidence_ceiling' }],
  [['sp_0224', 'sp_0451'].sort().join('::'), { code: 'large_fish_outside_supported_prey_window', decisionImpact: 'risk_management', status: 'caution', domainCode: 'pair_risk_evidence_ceiling' }],
] as const);

const fish = selectCompatibilityLaunchCohort();
const byId = new Map(fish.map(item => [item.id, item]));

for (const [key, expectedBoundary] of expected) {
  const [leftId, rightId] = key.split('::');
  const ceiling = getCompatibilityPairEvidenceCeiling(leftId, rightId);
  assert.ok(ceiling, key);
  assert.equal(ceiling.code, expectedBoundary.code);
  assert.equal(ceiling.decisionImpact, expectedBoundary.decisionImpact);
  assert.ok(ceiling.sourceIds.length > 0);
  assert.ok(ceiling.note.length > 40);
  assert.equal(ceiling.researchDisposition, 'terminal_unknown_hold');

  const left = byId.get(leftId);
  const right = byId.get(rightId);
  assert.ok(left && right, key);
  const result = evaluateSpeciesCombination([left, right]);
  assert.equal(result.status, expectedBoundary.status, key + ' must use the reviewed pair-boundary impact');
  assert.ok(result.metadata.domainRuleCodes.includes(expectedBoundary.domainCode), key + ' must expose the pair boundary in domain metadata');
  const surfacedRules = expectedBoundary.status === 'insufficient_data' ? result.missingData : result.warningRules;
  assert.ok(surfacedRules.some(rule => rule.code === expectedBoundary.code), key + ' must surface the specific reviewed pair evidence note');
  for (const sourceId of ceiling.sourceIds) assert.ok(result.evidenceIds?.includes(sourceId), key + ' must retain pair evidence provenance');
}

console.log('compatibility pair evidence ceilings passed: identity-critical pairs remain unknown, risk-manageable pair uncertainty is caution, and all three retain reviewed provenance');
