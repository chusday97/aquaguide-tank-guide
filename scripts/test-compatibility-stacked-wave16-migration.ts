import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { nextWaveUnified16ProfileIds, nextWaveUnified16Sources } from '../src/data/catalogReviewBatches/next-wave-unified-16';
import { compatibilityStackedWave16PendingProfileIds, compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';

const migrationPath = 'supabase/migrations/20261013153000_compatibility_unified_wave16_authority.sql';
const migration = readFileSync(migrationPath, 'utf8');
const audit = getCompatibilityEvidenceAudit();

assert.equal(audit.reviewedProfiles.length, 124, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);
assert.deepEqual([...compatibilityStackedWave16PendingProfileIds], [...nextWaveUnified16ProfileIds]);

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave16-20261013');
assert.ok(batch);
assert.equal(batch.migrationOwner, migrationPath);
assert.equal(batch.members.length, 12);
assert.equal(batch.members.filter(item => item.expectProfile).length, 1);

assert.match(migration, /expected predecessor 100 reviewed Compatibility profiles/);
assert.match(migration, /expected predecessor 176 reviewed evidence sources/);
assert.match(migration, /expected 101 reviewed Compatibility profiles/);
assert.match(migration, /expected 177 reviewed evidence sources/);
assert.match(migration, /expected 1 wave16 profile-source link/);
assert.match(migration, /commit;\s*$/);

const profile = getReviewedCompatibilityProfile('sp_0052');
assert.ok(profile);
assert.ok(
  profile.citations.some(citation => citation.id === nextWaveUnified16Sources.corydorasHastatusFishBase.id),
  'current sp_0052 profile must retain the Wave16 FishBase source even when later reviewed authority appends new citations',
);
assert.equal(migration.includes("'sp_0052'"), true);
assert.equal(migration.includes(nextWaveUnified16Sources.corydorasHastatusFishBase.id), true);

console.log('Compatibility stacked wave16 migration PASS: predecessor 100/176 -> target 101/177, 1 Profile, 1 new evidence source, 1 link.');
