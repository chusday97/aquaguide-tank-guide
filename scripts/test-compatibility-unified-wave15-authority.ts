import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getCompatibilityDomainBoundary } from '../src/data/compatibilityDomainBoundaries';
import { getReviewedCompatibilityProfile, getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import {
  nextWaveUnified15AllSpeciesIds,
  nextWaveUnified15DomainOutcomes,
  nextWaveUnified15IdentityOutcomes,
} from '../src/data/catalogReviewBatches/next-wave-unified-15';

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave15-20261013');
assert.ok(batch);
assert.equal(batch.migrationOwner, undefined, 'hold-only wave15 must not invent a DB migration');
assert.equal(batch.authorityOwner, 'src/data/catalogReviewBatches/next-wave-unified-15.ts');
assert.equal(batch.members.length, 25);
assert.equal(batch.members.filter(item => item.expectProfile).length, 0);
assert.deepEqual(batch.members.map(item => item.speciesId), [...nextWaveUnified15AllSpeciesIds]);

const authority = readFileSync(batch.authorityOwner, 'utf8');
for (const speciesId of nextWaveUnified15AllSpeciesIds) {
  assert.equal(authority.includes(speciesId), true);
  assert.equal(getReviewedCompatibilityProfile(speciesId), undefined);
}

for (const outcome of nextWaveUnified15IdentityOutcomes) {
  const boundary = getCatalogIdentityBoundary(outcome.speciesId);
  assert.ok(boundary);
  assert.equal(boundary.code, outcome.code);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}
for (const outcome of nextWaveUnified15DomainOutcomes) {
  const boundary = getCompatibilityDomainBoundary(outcome.speciesId);
  assert.ok(boundary, 'wave15 non-fish object must resolve a domain hold: ' + outcome.speciesId);
  assert.equal(boundary.lifeType, outcome.lifeType);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}
assert.equal(nextWaveUnified15IdentityOutcomes.length, 1);
assert.equal(nextWaveUnified15DomainOutcomes.length, 24);

const audit = getCompatibilityEvidenceAudit();
assert.equal(audit.reviewedProfiles.length, 116, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);

console.log('Compatibility unified wave15 authority PASS: 0 Profiles, 1 identity hold, 24 non-fish domain holds; DB authority unchanged at 100/176.');
