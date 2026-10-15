import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { nextWaveUnified06ProfileIds, nextWaveUnified06Sources } from '../src/data/catalogReviewBatches/next-wave-unified-06';
import { compatibilityStackedWave06PendingProfileIds, compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';

const migrationPath = 'supabase/migrations/20261012023000_compatibility_unified_wave06_authority.sql';
const migration = readFileSync(migrationPath, 'utf8');
const audit = getCompatibilityEvidenceAudit();

assert.equal(audit.reviewedProfiles.length, 106, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);
assert.deepEqual([...compatibilityStackedWave06PendingProfileIds].sort(), [...nextWaveUnified06ProfileIds].sort());

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave06-20261012');
assert.ok(batch);
assert.equal(batch.migrationOwner, migrationPath);
assert.equal(batch.members.length, 25, 'all 25 candidates must be classified in one batch');
assert.equal(batch.members.filter(item => item.expectProfile).length, 1);
assert.equal(batch.members.filter(item => !item.expectProfile).length, 24);

assert.match(migration, /^-- Stacked Compatibility wave06 authority\.[\s\S]*?\nbegin;/);
assert.match(migration, /expected predecessor 99 reviewed Compatibility profiles/);
assert.match(migration, /expected predecessor 175 reviewed evidence sources/);
assert.match(migration, /expected 100 reviewed Compatibility profiles/);
assert.match(migration, /expected 176 reviewed evidence sources/);
assert.match(migration, /expected 3 wave06 profile-source links/);
assert.match(migration, /commit;\s*$/);

let historicalLinks = 0;
for (const speciesId of nextWaveUnified06ProfileIds) {
  const profile = getReviewedCompatibilityProfile(speciesId);
  assert.ok(profile, 'wave06 Profile must exist: ' + speciesId);
  assert.equal(migration.includes("'" + speciesId + "'"), true);
  const historicalCitations = profile.citations.filter(source => migration.includes(source.id));
  assert.ok(historicalCitations.length > 0, 'wave06 Profile must retain historical citations: ' + speciesId);
  historicalLinks += historicalCitations.length;
}
assert.equal(historicalLinks, 3, 'historical wave06 migration must retain its original three Profile-source links even when later additive patches append citations');
assert.equal(Object.values(nextWaveUnified06Sources).length, 1);

for (const member of batch.members.filter(item => !item.expectProfile)) {
  assert.equal(getReviewedCompatibilityProfile(member.speciesId), undefined);
  assert.equal(getCatalogIdentityBoundary(member.speciesId)?.researchDisposition, 'terminal_unknown_hold');
  assert.equal(migration.includes("'" + member.speciesId + "'"), true);
}

console.log('Compatibility stacked wave06 migration PASS: predecessor 99/175 -> target 100/176, 1 Profile, 24 identity/category holds, 1 new source, 3 links.');
