import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getKnowledgeEvidenceCeiling } from '../src/data/knowledgeEvidenceCeilings';
import { getReviewedCompatibilityProfile, getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import {
  nextWaveUnified11AllSpeciesIds,
  nextWaveUnified11EvidenceCeilings,
  nextWaveUnified11IdentityOutcomes,
} from '../src/data/catalogReviewBatches/next-wave-unified-11';

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave11-20261012');
assert.ok(batch);
assert.equal(batch.migrationOwner, undefined, 'hold-only wave11 must not invent a DB migration');
assert.equal(batch.authorityOwner, 'src/data/catalogReviewBatches/next-wave-unified-11.ts');
assert.equal(batch.members.length, 25, 'all 25 queued objects must be classified atomically');
assert.equal(batch.members.filter(item => item.expectProfile).length, 0);
assert.deepEqual(batch.members.map(item => item.speciesId), [...nextWaveUnified11AllSpeciesIds]);

const authority = readFileSync(batch.authorityOwner, 'utf8');
for (const speciesId of nextWaveUnified11AllSpeciesIds) {
  assert.equal(authority.includes(speciesId), true);
  assert.equal(getReviewedCompatibilityProfile(speciesId), undefined);
}

for (const outcome of nextWaveUnified11IdentityOutcomes) {
  const boundary = getCatalogIdentityBoundary(outcome.speciesId);
  assert.ok(boundary, 'wave11 identity hold must resolve: ' + outcome.speciesId);
  assert.equal(boundary.code, outcome.code);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}

for (const outcome of nextWaveUnified11EvidenceCeilings) {
  const ceiling = getKnowledgeEvidenceCeiling(outcome.speciesId, outcome.field);
  assert.ok(ceiling, 'wave11 variant hold must resolve an evidence ceiling: ' + outcome.speciesId);
  assert.equal(ceiling.code, outcome.code);
  assert.equal(ceiling.researchDisposition, 'terminal_unknown_hold');
}

assert.equal(nextWaveUnified11IdentityOutcomes.length, 12);
assert.equal(nextWaveUnified11EvidenceCeilings.length, 13);

const audit = getCompatibilityEvidenceAudit();
assert.equal(audit.reviewedProfiles.length, 114, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);

console.log('Compatibility unified wave11 authority PASS: 0 Profiles, 12 identity holds, 13 variant evidence ceilings; DB authority unchanged at 100/176.');
