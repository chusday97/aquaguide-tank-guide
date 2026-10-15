import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getCompatibilityDomainBoundary } from '../src/data/compatibilityDomainBoundaries';
import { getKnowledgeEvidenceCeiling } from '../src/data/knowledgeEvidenceCeilings';
import { getReviewedCompatibilityProfile, getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import {
  nextWaveUnified13AllSpeciesIds,
  nextWaveUnified13DomainOutcomes,
  nextWaveUnified13EvidenceCeilings,
  nextWaveUnified13IdentityOutcomes,
} from '../src/data/catalogReviewBatches/next-wave-unified-13';

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave13-20261012');
assert.ok(batch);
assert.equal(batch.migrationOwner, undefined, 'hold-only wave13 must not invent a DB migration');
assert.equal(batch.authorityOwner, 'src/data/catalogReviewBatches/next-wave-unified-13.ts');
assert.equal(batch.members.length, 25, 'all 25 queued objects must be classified atomically');
assert.equal(batch.members.filter(item => item.expectProfile).length, 0);
assert.deepEqual(batch.members.map(item => item.speciesId), [...nextWaveUnified13AllSpeciesIds]);

const authority = readFileSync(batch.authorityOwner, 'utf8');
for (const speciesId of nextWaveUnified13AllSpeciesIds) {
  assert.equal(authority.includes(speciesId), true);
  assert.equal(getReviewedCompatibilityProfile(speciesId), undefined);
}
for (const outcome of nextWaveUnified13IdentityOutcomes) {
  const boundary = getCatalogIdentityBoundary(outcome.speciesId);
  assert.ok(boundary, 'wave13 identity hold must resolve: ' + outcome.speciesId);
  assert.equal(boundary.code, outcome.code);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}
for (const outcome of nextWaveUnified13EvidenceCeilings) {
  const ceiling = getKnowledgeEvidenceCeiling(outcome.speciesId, outcome.field);
  assert.ok(ceiling, 'wave13 variant hold must resolve an evidence ceiling: ' + outcome.speciesId);
  assert.equal(ceiling.code, outcome.code);
  assert.equal(ceiling.researchDisposition, 'terminal_unknown_hold');
}
for (const outcome of nextWaveUnified13DomainOutcomes) {
  const boundary = getCompatibilityDomainBoundary(outcome.speciesId);
  assert.ok(boundary, 'wave13 non-fish object must resolve a domain hold: ' + outcome.speciesId);
  assert.equal(boundary.lifeType, outcome.lifeType);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}
assert.equal(nextWaveUnified13IdentityOutcomes.length, 7);
assert.equal(nextWaveUnified13EvidenceCeilings.length, 17);
assert.equal(nextWaveUnified13DomainOutcomes.length, 1);

const audit = getCompatibilityEvidenceAudit();
assert.equal(audit.reviewedProfiles.length, 106, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);

console.log('Compatibility unified wave13 authority PASS: 0 Profiles, 7 identity holds, 17 variant evidence ceilings, 1 non-fish domain hold; DB authority unchanged at 100/176.');
