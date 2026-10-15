import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import {
  nextWaveUnified04ProfileIds,
  nextWaveUnified04Sources,
} from '../src/data/catalogReviewBatches/next-wave-unified-04';
import {
  compatibilityStackedWave04PendingProfileIds,
  compatibilityUnifiedNextWave,
} from '../src/data/compatibilityNextWaveBatch';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getCompatibilityDomainBoundary } from '../src/data/compatibilityDomainBoundaries';
import { buildCompatibilityProfileRolloutKeysets } from '../src/data/compatibilityAuthorityRollout';

const migrationPath = 'supabase/migrations/20261012001500_compatibility_unified_wave04_authority.sql';
const migration = readFileSync(migrationPath, 'utf8');
const audit = getCompatibilityEvidenceAudit();

assert.equal(audit.reviewedProfiles.length, 105, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(buildCompatibilityProfileRolloutKeysets(audit.reviewedProfiles.map(profile => profile.speciesId)).wave04Target.size, 95);
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);
assert.equal(nextWaveUnified04ProfileIds.length, 10);
assert.deepEqual(
  [...compatibilityStackedWave04PendingProfileIds].sort(),
  [...nextWaveUnified04ProfileIds].sort(),
  'stacked runtime delta must exactly match wave04 released Profile IDs',
);

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave04-20261011');
assert.ok(batch);
assert.equal(batch.migrationOwner, migrationPath);
assert.equal(batch.members.length, 10);
assert.deepEqual(
  batch.members.map(item => item.speciesId).sort(),
  [...nextWaveUnified04ProfileIds].sort(),
);

assert.match(migration, /^-- Stacked Compatibility wave04 authority\.[\s\S]*?\nbegin;/);
assert.match(migration, /commit;\s*$/);
assert.match(migration, /expected predecessor 85 reviewed Compatibility profiles/);
assert.match(migration, /expected predecessor 160 reviewed evidence sources/);
assert.match(migration, /expected 95 reviewed Compatibility profiles/);
assert.match(migration, /expected 171 reviewed evidence sources/);
assert.match(migration, /expected 21 wave04 profile-source links/);
assert.match(migration, /six predecessor evidence sources for reviewed bridges/);

const predecessorSourceIds = new Set([
  'batch19-fishbase-scleropages-formosus',
  'seriouslyfish-scleropages-formosus',
  'seriouslyfish-mikrogeophagus-ramirezi',
  'fishbase-mikrogeophagus-ramirezi',
  'seriouslyfish-gymnocorymbus-ternetzi',
  'fishbase-gymnocorymbus-ternetzi',
]);
const waveSources = Object.values(nextWaveUnified04Sources);
const newSourceIds = waveSources.map(source => source.id).filter(id => !predecessorSourceIds.has(id));
assert.equal(newSourceIds.length, 11);

let historicalLinks = 0;
for (const speciesId of nextWaveUnified04ProfileIds) {
  const profile = getReviewedCompatibilityProfile(speciesId);
  assert.ok(profile, 'wave04 Profile must exist: ' + speciesId);
  assert.equal(migration.includes("'" + speciesId + "'"), true, 'migration must own Profile ' + speciesId);
  const historicalCitations = profile.citations.filter(source => migration.includes(source.id));
  assert.ok(historicalCitations.length > 0, 'wave04 Profile must retain at least one historical citation: ' + speciesId);
  historicalLinks += historicalCitations.length;
}
assert.equal(historicalLinks, 21, 'historical wave04 migration must retain its original 21 Profile-source links even when later additive patches append citations');

for (const sourceId of newSourceIds) {
  assert.equal(migration.includes(sourceId), true, 'migration must insert new source ' + sourceId);
}
for (const sourceId of predecessorSourceIds) {
  assert.equal(migration.includes(sourceId), true, 'migration must require predecessor source ' + sourceId);
}

for (const speciesId of compatibilityUnifiedNextWave.identityBoundaryHoldSpeciesIds) {
  assert.equal(getReviewedCompatibilityProfile(speciesId), undefined);
  assert.equal(getCatalogIdentityBoundary(speciesId)?.researchDisposition, 'terminal_unknown_hold');
}
for (const speciesId of compatibilityUnifiedNextWave.domainBoundaryHoldSpeciesIds) {
  assert.equal(getReviewedCompatibilityProfile(speciesId), undefined);
  assert.equal(getCompatibilityDomainBoundary(speciesId)?.researchDisposition, 'terminal_unknown_hold');
}

console.log('Compatibility stacked wave04 migration PASS: predecessor 85/160 -> target 95/171, 10 Profiles, 11 new evidence sources, 21 links, holds fail closed.');
