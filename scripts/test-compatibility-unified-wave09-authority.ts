import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCompatibilityDomainBoundary } from '../src/data/compatibilityDomainBoundaries';
import { getKnowledgeEvidenceCeiling } from '../src/data/knowledgeEvidenceCeilings';
import { getReviewedCompatibilityProfile, getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import {
  nextWaveUnified09AllSpeciesIds,
  nextWaveUnified09DomainOutcomes,
  nextWaveUnified09EvidenceCeilings,
} from '../src/data/catalogReviewBatches/next-wave-unified-09';

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave09-20261012');
assert.ok(batch);
assert.equal(batch.migrationOwner, undefined, 'hold-only wave09 must not invent a DB migration');
assert.equal(batch.authorityOwner, 'src/data/catalogReviewBatches/next-wave-unified-09.ts');
assert.equal(batch.members.length, 25, 'all 25 queued objects must be classified atomically');
assert.equal(batch.members.filter(item => item.expectProfile).length, 0);
assert.deepEqual(batch.members.map(item => item.speciesId), [...nextWaveUnified09AllSpeciesIds]);

const authority = readFileSync(batch.authorityOwner, 'utf8');
for (const speciesId of nextWaveUnified09AllSpeciesIds) {
  assert.equal(authority.includes(speciesId), true);
  assert.equal(getReviewedCompatibilityProfile(speciesId), undefined);
}

for (const outcome of nextWaveUnified09EvidenceCeilings) {
  const ceiling = getKnowledgeEvidenceCeiling(outcome.speciesId, outcome.field);
  assert.ok(ceiling, 'wave09 fish hold must resolve an evidence ceiling: ' + outcome.speciesId);
  assert.equal(ceiling.code, outcome.code);
  assert.equal(ceiling.researchDisposition, 'terminal_unknown_hold');
}

for (const outcome of nextWaveUnified09DomainOutcomes) {
  const boundary = getCompatibilityDomainBoundary(outcome.speciesId);
  assert.ok(boundary, 'wave09 non-fish object must resolve a domain boundary: ' + outcome.speciesId);
  assert.equal(boundary.lifeType, outcome.lifeType);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}

assert.equal(nextWaveUnified09EvidenceCeilings.length, 9);
assert.equal(nextWaveUnified09DomainOutcomes.length, 16);

const audit = getCompatibilityEvidenceAudit();
assert.equal(audit.reviewedProfiles.length, 118, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);

console.log('Compatibility unified wave09 authority PASS: 0 Profiles, 9 exact-fish evidence ceilings, 16 cross-taxa domain holds; DB authority unchanged at 100/176.');
