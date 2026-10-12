import assert from 'node:assert/strict';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import {
  buildCompatibilityProfileRolloutKeysets,
  getCompatibilityProfileRolloutGeneration,
} from '../src/data/compatibilityAuthorityRollout';
import {
  compatibilityProductionRolloutPendingProfileIds,
  compatibilityStackedWave04PendingProfileIds,
  compatibilityStackedWave05PendingProfileIds,
} from '../src/data/compatibilityNextWaveBatch';

const targetIds = getCompatibilityEvidenceAudit().reviewedProfiles.map(profile => profile.speciesId).sort();
const keysets = buildCompatibilityProfileRolloutKeysets(targetIds);

assert.equal(targetIds.length, 99);
assert.equal(compatibilityProductionRolloutPendingProfileIds.length, 22);
assert.equal(compatibilityStackedWave04PendingProfileIds.length, 10);
assert.equal(compatibilityStackedWave05PendingProfileIds.length, 4);
assert.equal(keysets.currentProduction.size, 63);
assert.equal(keysets.productionTarget.size, 85);
assert.equal(keysets.wave04Target.size, 95);
assert.equal(keysets.target.size, 99);

assert.equal(getCompatibilityProfileRolloutGeneration(targetIds, targetIds), 'target');
assert.equal(getCompatibilityProfileRolloutGeneration([...keysets.wave04Target], targetIds), 'wave04-target');
assert.equal(getCompatibilityProfileRolloutGeneration([...keysets.productionTarget], targetIds), 'production-target');
assert.equal(getCompatibilityProfileRolloutGeneration([...keysets.currentProduction], targetIds), 'current-production');

const current = [...keysets.currentProduction].sort();
const production = [...keysets.productionTarget].sort();
const wave04 = [...keysets.wave04Target].sort();
const productionPending = [...compatibilityProductionRolloutPendingProfileIds];
const wave04Pending = [...compatibilityStackedWave04PendingProfileIds];
const wave05Pending = [...compatibilityStackedWave05PendingProfileIds];

assert.equal(getCompatibilityProfileRolloutGeneration(current.slice(0, -1), targetIds), null, '62 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration([...current, productionPending[0]], targetIds), null, '64 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(production.slice(0, -1), targetIds), null, '84 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration([...production, wave04Pending[0]], targetIds), null, '86 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(wave04.slice(0, -1), targetIds), null, '94 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration([...wave04, wave05Pending[0]], targetIds), null, '96 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(targetIds.slice(0, -1), targetIds), null, '98 Profiles must fail closed');

const wrong63 = [...current]; wrong63[0] = productionPending[0];
const wrong85 = [...production]; wrong85[0] = wave04Pending[0];
const wrong95 = [...wave04]; wrong95[0] = wave05Pending[0];
assert.equal(getCompatibilityProfileRolloutGeneration(wrong63, targetIds), null, 'wrong 63-key baseline must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(wrong85, targetIds), null, 'wrong 85-key target must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(wrong95, targetIds), null, 'wrong 95-key target must fail closed');

for (const speciesId of compatibilityProductionRolloutPendingProfileIds) {
  assert.equal(keysets.productionTarget.has(speciesId), true);
  assert.equal(keysets.currentProduction.has(speciesId), false);
}
for (const speciesId of compatibilityStackedWave04PendingProfileIds) {
  assert.equal(keysets.wave04Target.has(speciesId), true);
  assert.equal(keysets.productionTarget.has(speciesId), false);
}
for (const speciesId of compatibilityStackedWave05PendingProfileIds) {
  assert.equal(keysets.target.has(speciesId), true);
  assert.equal(keysets.wave04Target.has(speciesId), false);
}

console.log('Compatibility rollout window PASS: exact 63 / 85 / 95 / 99 Profile generations only; all intermediate and mismatched keysets fail closed.');
