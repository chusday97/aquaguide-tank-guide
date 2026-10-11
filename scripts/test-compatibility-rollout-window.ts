import assert from 'node:assert/strict';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import {
  buildCompatibilityProfileRolloutKeysets,
  getCompatibilityProfileRolloutGeneration,
} from '../src/data/compatibilityAuthorityRollout';
import {
  compatibilityProductionRolloutPendingProfileIds,
  compatibilityStackedWave04PendingProfileIds,
} from '../src/data/compatibilityNextWaveBatch';

const targetIds = getCompatibilityEvidenceAudit().reviewedProfiles.map(profile => profile.speciesId).sort();
const keysets = buildCompatibilityProfileRolloutKeysets(targetIds);

assert.equal(targetIds.length, 95);
assert.equal(compatibilityProductionRolloutPendingProfileIds.length, 22);
assert.equal(compatibilityStackedWave04PendingProfileIds.length, 10);
assert.equal(keysets.currentProduction.size, 63);
assert.equal(keysets.predecessorTarget.size, 85);
assert.equal(keysets.target.size, 95);

assert.equal(getCompatibilityProfileRolloutGeneration(targetIds, targetIds), 'target');
assert.equal(
  getCompatibilityProfileRolloutGeneration([...keysets.predecessorTarget], targetIds),
  'predecessor-target',
);
assert.equal(
  getCompatibilityProfileRolloutGeneration([...keysets.currentProduction], targetIds),
  'current-production',
);

const current = [...keysets.currentProduction].sort();
const predecessor = [...keysets.predecessorTarget].sort();
const productionPending = [...compatibilityProductionRolloutPendingProfileIds];
const stackedPending = [...compatibilityStackedWave04PendingProfileIds];

assert.equal(getCompatibilityProfileRolloutGeneration(current.slice(0, -1), targetIds), null, '62 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration([...current, productionPending[0]], targetIds), null, '64 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(predecessor.slice(0, -1), targetIds), null, '84 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration([...predecessor, stackedPending[0]], targetIds), null, '86 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(targetIds.slice(0, -1), targetIds), null, '94 Profiles must fail closed');

const wrong63 = [...current];
wrong63[0] = productionPending[0];
assert.equal(getCompatibilityProfileRolloutGeneration(wrong63, targetIds), null, 'wrong 63-key baseline must fail closed');

const wrong85 = [...predecessor];
wrong85[0] = stackedPending[0];
assert.equal(getCompatibilityProfileRolloutGeneration(wrong85, targetIds), null, 'wrong 85-key predecessor must fail closed');

for (const speciesId of compatibilityProductionRolloutPendingProfileIds) {
  assert.equal(keysets.predecessorTarget.has(speciesId), true);
  assert.equal(keysets.currentProduction.has(speciesId), false);
}
for (const speciesId of compatibilityStackedWave04PendingProfileIds) {
  assert.equal(keysets.target.has(speciesId), true);
  assert.equal(keysets.predecessorTarget.has(speciesId), false);
}

console.log('Compatibility rollout window PASS: exact 63 Production, exact 85 predecessor, or exact 95 target only; all intermediate/mismatched sets fail closed.');
