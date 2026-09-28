import assert from 'node:assert/strict';
import { compatibilityPairEvidenceCeilings, getCompatibilityPairEvidenceCeiling } from '../src/data/compatibilityPairEvidenceCeilings';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';

assert.equal(compatibilityPairEvidenceCeilings.length, 3);

const expected = new Map([
  [['sp_0002', 'sp_0224'].sort().join('::'), 'prey_trade_identity_not_resolved'],
  [['sp_0224', 'sp_0428'].sort().join('::'), 'gastropod_predation_not_established'],
  [['sp_0224', 'sp_0451'].sort().join('::'), 'large_fish_outside_supported_prey_window'],
]);

const fish = selectCompatibilityLaunchCohort();
const byId = new Map(fish.map(item => [item.id, item]));

for (const [key, code] of expected) {
  const [leftId, rightId] = key.split('::');
  const ceiling = getCompatibilityPairEvidenceCeiling(leftId, rightId);
  assert.ok(ceiling, key);
  assert.equal(ceiling.code, code);
  assert.ok(ceiling.sourceIds.length > 0);
  assert.ok(ceiling.note.length > 40);

  const left = byId.get(leftId);
  const right = byId.get(rightId);
  assert.ok(left && right, key);
  const result = evaluateSpeciesCombination([left, right]);
  assert.equal(result.status, 'insufficient_data', key + ' must remain fail-closed');
}

console.log('compatibility pair evidence ceilings passed: 3 unresolved launch pairs are explicit reviewed ceilings');
