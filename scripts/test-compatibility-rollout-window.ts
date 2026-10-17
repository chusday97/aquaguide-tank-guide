import assert from 'node:assert/strict';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import {
  compatibilityProductionRolloutPendingProfileIds,
  compatibilityStackedWave04PendingProfileIds,
  compatibilityStackedWave05PendingProfileIds,
  compatibilityStackedWave06PendingProfileIds,
  compatibilityStackedWave16PendingProfileIds,
  compatibilitySourceControlledPendingProfileIds,
} from '../src/data/compatibilityNextWaveBatch';
import {
  buildCompatibilityProfileRolloutKeysets,
  getCompatibilityProfileAuthorityGeneration,
  getCompatibilityProfileRolloutGeneration,
} from '../src/data/compatibilityAuthorityRollout';

const audit = getCompatibilityEvidenceAudit();
const targetIds = audit.reviewedProfiles.map(item => item.speciesId);
assert.equal(targetIds.length, 114, 'repository authority includes thirteen reviewed source-controlled identity-correction Profiles beyond the released target');

const keysets = buildCompatibilityProfileRolloutKeysets(targetIds);
assert.equal(keysets.currentProduction.size, 63);
assert.equal(keysets.productionTarget.size, 85);
assert.equal(keysets.wave04Target.size, 95);
assert.equal(keysets.wave05Target.size, 99);
assert.equal(keysets.wave06Target.size, 100);
assert.equal(keysets.target.size, 101);
assert.deepEqual([...compatibilitySourceControlledPendingProfileIds].sort(), ['sp_0176', 'sp_0177', 'sp_0178', 'sp_0221', 'sp_0229', 'sp_0236', 'sp_0240', 'sp_0242', 'sp_0266', 'sp_0272', 'sp_0388', 'sp_0407', 'sp_0408']);
for (const speciesId of compatibilitySourceControlledPendingProfileIds) {
  assert.equal(keysets.target.has(speciesId), false, 'source-controlled identity corrections must not silently enter the released 101-Profile target: ' + speciesId);
}

assert.equal(getCompatibilityProfileRolloutGeneration([...keysets.target], targetIds), 'target');
assert.equal(getCompatibilityProfileRolloutGeneration([...keysets.wave06Target], targetIds), 'wave06-target');
assert.equal(getCompatibilityProfileRolloutGeneration([...keysets.wave05Target], targetIds), 'wave05-target');
assert.equal(getCompatibilityProfileRolloutGeneration([...keysets.wave04Target], targetIds), 'wave04-target');
assert.equal(getCompatibilityProfileRolloutGeneration([...keysets.productionTarget], targetIds), 'production-target');
assert.equal(getCompatibilityProfileRolloutGeneration([...keysets.currentProduction], targetIds), 'current-production');
const futureProfile = 'sp_future_generic';
assert.equal(getCompatibilityProfileAuthorityGeneration(targetIds, targetIds), 'post-target-superset', 'full repository authority may grow beyond the released target without changing Production generations');
assert.equal(
  getCompatibilityProfileAuthorityGeneration([...targetIds, futureProfile], targetIds),
  'post-target-superset',
  'full target plus a new reviewed profile must not require a new hard-coded rollout generation',
);
assert.equal(
  getCompatibilityProfileAuthorityGeneration([...targetIds.slice(1), futureProfile], targetIds),
  null,
  'a future profile must not hide a missing baseline profile',
);
assert.equal(
  getCompatibilityProfileAuthorityGeneration([...keysets.productionTarget, futureProfile], targetIds),
  null,
  'future profile growth is allowed only after the complete repository target is present',
);

const current = [...keysets.currentProduction].sort();
const production = [...keysets.productionTarget].sort();
const wave04 = [...keysets.wave04Target].sort();
const wave05 = [...keysets.wave05Target].sort();
const wave06 = [...keysets.wave06Target].sort();
const target = [...keysets.target].sort();
const productionPending = [...compatibilityProductionRolloutPendingProfileIds];
const wave04Pending = [...compatibilityStackedWave04PendingProfileIds];
const wave05Pending = [...compatibilityStackedWave05PendingProfileIds];
const wave06Pending = [...compatibilityStackedWave06PendingProfileIds];
const wave16Pending = [...compatibilityStackedWave16PendingProfileIds];

assert.equal(getCompatibilityProfileRolloutGeneration(current.slice(0, -1), targetIds), null, '62 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration([...current, productionPending[0]], targetIds), null, '64 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(production.slice(0, -1), targetIds), null, '84 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration([...production, wave04Pending[0]], targetIds), null, '86 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(wave04.slice(0, -1), targetIds), null, '94 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration([...wave04, wave05Pending[0]], targetIds), null, '96 Profiles must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(wave05.slice(0, -1), targetIds), null, '98 Profiles must fail closed');

const wrong63 = [...current]; wrong63[0] = productionPending[0];
const wrong85 = [...production]; wrong85[0] = wave04Pending[0];
const wrong95 = [...wave04]; wrong95[0] = wave05Pending[0];
const wrong99 = [...wave05]; wrong99[0] = wave06Pending[0];
const wrong100 = [...wave06]; wrong100[0] = 'sp_not_a_real_profile';
const wrong101 = [...target]; wrong101[0] = 'sp_not_a_real_profile';
assert.equal(getCompatibilityProfileRolloutGeneration(wrong63, targetIds), null, 'wrong 63-key baseline must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(wrong85, targetIds), null, 'wrong 85-key target must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(wrong95, targetIds), null, 'wrong 95-key target must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(wrong99, targetIds), null, 'wrong 99-key wave05 target must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(wrong100, targetIds), null, 'wrong 100-key wave06 target must fail closed');
assert.equal(getCompatibilityProfileRolloutGeneration(wrong101, targetIds), null, 'wrong 101-key repository target must fail closed');

for (const speciesId of compatibilityProductionRolloutPendingProfileIds) {
  assert.equal(keysets.productionTarget.has(speciesId), true);
  assert.equal(keysets.currentProduction.has(speciesId), false);
}
for (const speciesId of compatibilityStackedWave04PendingProfileIds) {
  assert.equal(keysets.wave04Target.has(speciesId), true);
  assert.equal(keysets.productionTarget.has(speciesId), false);
}
for (const speciesId of compatibilityStackedWave05PendingProfileIds) {
  assert.equal(keysets.wave05Target.has(speciesId), true);
  assert.equal(keysets.wave04Target.has(speciesId), false);
}
for (const speciesId of compatibilityStackedWave06PendingProfileIds) {
  assert.equal(keysets.wave06Target.has(speciesId), true);
  assert.equal(keysets.wave05Target.has(speciesId), false);
}
for (const speciesId of wave16Pending) {
  assert.equal(keysets.target.has(speciesId), true);
  assert.equal(keysets.wave06Target.has(speciesId), false);
}

console.log('Compatibility rollout window PASS: exact 63 / 85 / 95 / 99 / 100 / 101 rollout generations stay fail-closed, while complete-target authority can grow monotonically with reviewed new profiles.');
