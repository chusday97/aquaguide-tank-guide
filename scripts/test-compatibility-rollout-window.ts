import assert from 'node:assert/strict';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { buildCompatibilityProfileRolloutKeysets, getCompatibilityProfileRolloutGeneration } from '../src/data/compatibilityAuthorityRollout';
import { compatibilityProductionRolloutPendingProfileIds } from '../src/data/compatibilityNextWaveBatch';

const targetIds = getCompatibilityEvidenceAudit().reviewedProfiles.map(profile => profile.speciesId).sort();
const keysets = buildCompatibilityProfileRolloutKeysets(targetIds);
assert.equal(targetIds.length, 85);
assert.equal(compatibilityProductionRolloutPendingProfileIds.length, 22);
assert.equal(keysets.currentProduction.size, 63);
assert.equal(keysets.target.size, 85);
assert.equal(getCompatibilityProfileRolloutGeneration(targetIds, targetIds), 'target');
assert.equal(getCompatibilityProfileRolloutGeneration([...keysets.currentProduction], targetIds), 'current-production');

const current = [...keysets.currentProduction].sort();
const pending = [...compatibilityProductionRolloutPendingProfileIds];
assert.equal(getCompatibilityProfileRolloutGeneration(current.slice(0, -1), targetIds), null, '62 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration([...current, pending[0]], targetIds), null, '64 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(targetIds.slice(0, -1), targetIds), null, '84 Profiles must fail closed');

const wrongSameCount = [...current];
wrongSameCount[0] = pending[0];
assert.equal(getCompatibilityProfileRolloutGeneration(wrongSameCount, targetIds), null, 'wrong 63-key baseline must fail closed even when the count matches');

for (const speciesId of compatibilityProductionRolloutPendingProfileIds) {
  assert.equal(keysets.target.has(speciesId), true);
  assert.equal(keysets.currentProduction.has(speciesId), false);
}
console.log('Compatibility rollout window PASS: exact 63-key Production baseline or exact 85-key target only; all intermediate/mismatched sets fail closed.');
