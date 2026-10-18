import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getKnowledgeEvidenceCeiling } from '../src/data/knowledgeEvidenceCeilings';
import { getReviewedCompatibilityProfile, getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import {
  nextWaveUnified12AllSpeciesIds,
  nextWaveUnified12EvidenceCeilings,
  nextWaveUnified12IdentityOutcomes,
} from '../src/data/catalogReviewBatches/next-wave-unified-12';

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave12-20261012');
assert.ok(batch);
assert.equal(batch.migrationOwner, undefined, 'hold-only wave12 must not invent a DB migration');
assert.equal(batch.authorityOwner, 'src/data/catalogReviewBatches/next-wave-unified-12.ts');
assert.equal(batch.members.length, 25, 'all 25 queued objects must be classified atomically');
assert.equal(batch.members.filter(item => item.expectProfile).length, 0);
assert.deepEqual(batch.members.map(item => item.speciesId), [...nextWaveUnified12AllSpeciesIds]);

const authority = readFileSync(batch.authorityOwner, 'utf8');
for (const speciesId of nextWaveUnified12AllSpeciesIds) {
  assert.equal(authority.includes(speciesId), true);
  assert.equal(getReviewedCompatibilityProfile(speciesId), undefined);
}

for (const outcome of nextWaveUnified12IdentityOutcomes) {
  const boundary = getCatalogIdentityBoundary(outcome.speciesId);
  assert.ok(boundary, 'wave12 identity hold must resolve: ' + outcome.speciesId);
  assert.equal(boundary.code, outcome.code);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}

for (const outcome of nextWaveUnified12EvidenceCeilings) {
  const ceiling = getKnowledgeEvidenceCeiling(outcome.speciesId, outcome.field);
  assert.ok(ceiling, 'wave12 variant hold must resolve an evidence ceiling: ' + outcome.speciesId);
  assert.equal(ceiling.code, outcome.code);
  assert.equal(ceiling.researchDisposition, 'terminal_unknown_hold');
}

assert.equal(nextWaveUnified12IdentityOutcomes.length, 15);
assert.equal(nextWaveUnified12EvidenceCeilings.length, 10);

const audit = getCompatibilityEvidenceAudit();
assert.equal(audit.reviewedProfiles.length, 120, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);

console.log('Compatibility unified wave12 authority PASS: 0 Profiles, 15 identity holds, 10 variant evidence ceilings; DB authority unchanged at 100/176.');
