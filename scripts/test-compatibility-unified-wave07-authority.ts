import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getReviewedCompatibilityProfile, getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import { nextWaveUnified07Outcomes } from '../src/data/catalogReviewBatches/next-wave-unified-07';

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave07-20261012');
assert.ok(batch);
assert.equal(batch.migrationOwner, undefined, 'hold-only wave07 must not invent a DB migration');
assert.equal(batch.authorityOwner, 'src/data/catalogReviewBatches/next-wave-unified-07.ts');
assert.equal(batch.members.length, 25, 'all 25 queued objects must be classified atomically');
assert.equal(batch.members.filter(item => item.expectProfile).length, 0);
assert.deepEqual(batch.members.map(item => item.speciesId), nextWaveUnified07Outcomes.map(item => item.speciesId));

const authority = readFileSync(batch.authorityOwner, 'utf8');
for (const outcome of nextWaveUnified07Outcomes) {
  assert.equal(authority.includes(outcome.speciesId), true);
  assert.equal(getReviewedCompatibilityProfile(outcome.speciesId), undefined);
  const boundary = getCatalogIdentityBoundary(outcome.speciesId);
  assert.ok(boundary, 'wave07 outcome must resolve an identity/category boundary: ' + outcome.speciesId);
  assert.equal(boundary.code, outcome.code);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}

const audit = getCompatibilityEvidenceAudit();
assert.equal(audit.reviewedProfiles.length, 101);
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);

console.log('Compatibility unified wave07 authority PASS: 0 Profiles, 25 terminal identity/category holds, DB authority unchanged at 100/176.');
