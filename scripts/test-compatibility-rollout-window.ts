import assert from 'node:assert/strict';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import {
  buildCompatibilityProfileRolloutKeysets,
  getCompatibilityProfileRolloutGeneration,
} from '../src/data/compatibilityAuthorityRollout';
import { compatibilityProductionRolloutPendingProfileIds } from '../src/data/compatibilityNextWaveBatch';

const targetIds = getCompatibilityEvidenceAudit().reviewedProfiles.map(profile => profile.speciesId).sort();
const keysets = buildCompatibilityProfileRolloutKeysets(targetIds);

assert.equal(targetIds.length, 52);
assert.equal(compatibilityProductionRolloutPendingProfileIds.length, 10);
assert.equal(keysets.currentProduction.size, 42);
assert.equal(keysets.target.size, 52);
assert.equal(getCompatibilityProfileRolloutGeneration(targetIds, targetIds), 'target');
assert.equal(
  getCompatibilityProfileRolloutGeneration([...keysets.currentProduction], targetIds),
  'current-production',
);

const current = [...keysets.currentProduction].sort();
const pending = [...compatibilityProductionRolloutPendingProfileIds];
assert.equal(getCompatibilityProfileRolloutGeneration(current.slice(0, -1), targetIds), null, '41 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration([...current, pending[0]], targetIds), null, '43 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(targetIds.slice(0, -1), targetIds), null, '51 Profiles must fail closed');

const wrongSameCount = [...current];
wrongSameCount[0] = pending[0];
assert.equal(
  getCompatibilityProfileRolloutGeneration(wrongSameCount, targetIds),
  null,
  'wrong 42-key baseline must fail closed even when the count matches',
);

for (const speciesId of compatibilityProductionRolloutPendingProfileIds) {
  assert.equal(keysets.target.has(speciesId), true, `pending rollout Profile must exist in target authority: ${speciesId}`);
  assert.equal(keysets.currentProduction.has(speciesId), false, `pending rollout Profile must be absent from current Production baseline: ${speciesId}`);
}

console.log('Compatibility rollout window PASS: exact 42-key Production baseline or exact 52-key target only; all intermediate/mismatched sets fail closed.');
