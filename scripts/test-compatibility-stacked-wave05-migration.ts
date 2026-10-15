import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { nextWaveUnified05ProfileIds, nextWaveUnified05Sources } from '../src/data/catalogReviewBatches/next-wave-unified-05';
import { compatibilitySourceControlledPendingProfileIds, compatibilityStackedWave05PendingProfileIds, compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';

const migrationPath = 'supabase/migrations/20261012014500_compatibility_unified_wave05_authority.sql';
const migration = readFileSync(migrationPath, 'utf8');
const audit = getCompatibilityEvidenceAudit();

assert.equal(audit.reviewedProfiles.length, 108, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);
assert.deepEqual([...compatibilityStackedWave05PendingProfileIds].sort(), [...nextWaveUnified05ProfileIds].sort());

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave05-20261012');
assert.ok(batch);
assert.equal(batch.migrationOwner, migrationPath);
assert.equal(batch.members.length, 25, 'all 25 candidates must be classified in one batch');
assert.equal(batch.members.filter(item => item.expectProfile).length, 4);
assert.equal(batch.members.filter(item => !item.expectProfile).length, 21);

assert.match(migration, /^-- Stacked Compatibility wave05 authority\.[\s\S]*?\nbegin;/);
assert.match(migration, /expected predecessor 95 reviewed Compatibility profiles/);
assert.match(migration, /expected predecessor 171 reviewed evidence sources/);
assert.match(migration, /expected 99 reviewed Compatibility profiles/);
assert.match(migration, /expected 175 reviewed evidence sources/);
assert.match(migration, /expected 9 wave05 profile-source links/);
assert.match(migration, /commit;\s*$/);

const historicalWave05Links: Record<string, string[]> = {
  sp_0173: [
    'wave05-fishbase-salminus-brasiliensis',
    'wave05-seriouslyfish-salminus-brasiliensis',
  ],
  sp_0174: [
    'wave05-cbd-gymnocorymbus-albino-white',
    'seriouslyfish-gymnocorymbus-ternetzi',
    'fishbase-gymnocorymbus-ternetzi',
  ],
  sp_0207: [
    'wave05-cbd-gymnocorymbus-albino-white',
    'seriouslyfish-gymnocorymbus-ternetzi',
    'fishbase-gymnocorymbus-ternetzi',
  ],
  sp_0214: ['wave05-seriouslyfish-pelvicachromis-pulcher'],
};

let expectedLinks = 0;
for (const speciesId of nextWaveUnified05ProfileIds) {
  const profile = getReviewedCompatibilityProfile(speciesId);
  assert.ok(profile, 'wave05 Profile must exist: ' + speciesId);
  const historicalSourceIds = historicalWave05Links[speciesId] || [];
  expectedLinks += historicalSourceIds.length;
  assert.equal(migration.includes("'" + speciesId + "'"), true);
  for (const sourceId of historicalSourceIds) {
    assert.equal(profile.citations.some(source => source.id === sourceId), true, 'current Profile must retain historical wave05 citation ' + sourceId);
    assert.equal(migration.includes(sourceId), true, 'frozen wave05 migration must retain historical citation ' + sourceId);
  }
}
assert.equal(expectedLinks, 9);
assert.equal(
  getReviewedCompatibilityProfile('sp_0173')?.citations.some(source => source.id === 'aquaculture-international-salminus-aggression-wave20'),
  true,
  'later reviewed authority may grow the runtime Profile without rewriting the frozen wave05 migration',
);
assert.equal(Object.values(nextWaveUnified05Sources).length, 4);

for (const member of batch.members.filter(item => !item.expectProfile)) {
  assert.equal(migration.includes("'" + member.speciesId + "'"), true);
  const laterSourceControlledProfile = (compatibilitySourceControlledPendingProfileIds as readonly string[]).includes(member.speciesId);
  if (laterSourceControlledProfile) {
    assert.ok(getReviewedCompatibilityProfile(member.speciesId), 'later reviewed identity correction may add a Profile without rewriting the frozen Wave05 migration: ' + member.speciesId);
    assert.equal(getCatalogIdentityBoundary(member.speciesId), undefined, 'later reviewed object-level identity correction may supersede the historical Wave05 hold: ' + member.speciesId);
    continue;
  }
  assert.equal(getReviewedCompatibilityProfile(member.speciesId), undefined);
  assert.equal(getCatalogIdentityBoundary(member.speciesId)?.researchDisposition, 'terminal_unknown_hold');
}

console.log('Compatibility stacked wave05 migration PASS: predecessor 95/171 -> target 99/175, 4 Profiles, 21 identity holds, 4 new sources, 9 links.');
