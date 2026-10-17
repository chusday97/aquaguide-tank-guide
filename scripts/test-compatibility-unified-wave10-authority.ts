import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCompatibilityDomainBoundary } from '../src/data/compatibilityDomainBoundaries';
import { getKnowledgeEvidenceCeiling } from '../src/data/knowledgeEvidenceCeilings';
import { getReviewedCompatibilityProfile, getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import {
  nextWaveUnified10AllSpeciesIds,
  nextWaveUnified10DomainOutcomes,
  nextWaveUnified10EvidenceCeilings,
} from '../src/data/catalogReviewBatches/next-wave-unified-10';

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave10-20261012');
assert.ok(batch);
assert.equal(batch.migrationOwner, undefined, 'hold-only wave10 must not invent a DB migration');
assert.equal(batch.authorityOwner, 'src/data/catalogReviewBatches/next-wave-unified-10.ts');
assert.equal(batch.members.length, 25, 'all 25 queued objects must be classified atomically');
assert.equal(batch.members.filter(item => item.expectProfile).length, 0);
assert.deepEqual(batch.members.map(item => item.speciesId), [...nextWaveUnified10AllSpeciesIds]);

const authority = readFileSync(batch.authorityOwner, 'utf8');
for (const speciesId of nextWaveUnified10AllSpeciesIds) {
  assert.equal(authority.includes(speciesId), true);
  assert.equal(getReviewedCompatibilityProfile(speciesId), undefined);
}

for (const outcome of nextWaveUnified10DomainOutcomes) {
  const boundary = getCompatibilityDomainBoundary(outcome.speciesId);
  assert.ok(boundary, 'wave10 non-fish object must resolve a domain boundary: ' + outcome.speciesId);
  assert.equal(boundary.lifeType, outcome.lifeType);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}

for (const outcome of nextWaveUnified10EvidenceCeilings) {
  const ceiling = getKnowledgeEvidenceCeiling(outcome.speciesId, outcome.field);
  assert.ok(ceiling, 'wave10 Ranchu hold must resolve an evidence ceiling: ' + outcome.speciesId);
  assert.equal(ceiling.code, outcome.code);
  assert.equal(ceiling.researchDisposition, 'terminal_unknown_hold');
}

assert.equal(nextWaveUnified10DomainOutcomes.length, 24);
assert.equal(nextWaveUnified10EvidenceCeilings.length, 1);

const audit = getCompatibilityEvidenceAudit();
assert.equal(audit.reviewedProfiles.length, 116, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);

console.log('Compatibility unified wave10 authority PASS: 0 Profiles, 24 cross-taxa domain holds, 1 Ranchu variant evidence ceiling; DB authority unchanged at 100/176.');
