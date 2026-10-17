import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { catalogIdentityBoundaries, getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getCompatibilityDomainBoundary } from '../src/data/compatibilityDomainBoundaries';
import { getKnowledgeEvidenceCeiling } from '../src/data/knowledgeEvidenceCeilings';
import { getReviewedCompatibilityProfile, getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import {
  nextWaveUnified08AllSpeciesIds,
  nextWaveUnified08DomainOutcomes,
  nextWaveUnified08EvidenceCeilings,
  nextWaveUnified08IdentityOutcomes,
} from '../src/data/catalogReviewBatches/next-wave-unified-08';

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave08-20261012');
assert.ok(batch);
assert.equal(batch.migrationOwner, undefined, 'hold-only wave08 must not invent a DB migration');
assert.equal(batch.authorityOwner, 'src/data/catalogReviewBatches/next-wave-unified-08.ts');
assert.equal(batch.members.length, 25, 'all 25 queued objects must be classified atomically');
assert.equal(batch.members.filter(item => item.expectProfile).length, 0);
assert.deepEqual(batch.members.map(item => item.speciesId), [...nextWaveUnified08AllSpeciesIds]);

const authority = readFileSync(batch.authorityOwner, 'utf8');
for (const speciesId of nextWaveUnified08AllSpeciesIds) {
  assert.equal(authority.includes(speciesId), true);
  assert.equal(getReviewedCompatibilityProfile(speciesId), undefined);
}

const supersededClassificationOutcomes = new Set(['sp_0077', 'sp_0089']);
for (const outcome of nextWaveUnified08IdentityOutcomes) {
  const boundary = getCatalogIdentityBoundary(outcome.speciesId);
  if (supersededClassificationOutcomes.has(outcome.speciesId)) {
    const historicalBoundary = catalogIdentityBoundaries[outcome.speciesId];
    assert.ok(historicalBoundary, 'wave08 historical classification outcome must remain auditable: ' + outcome.speciesId);
    assert.equal(historicalBoundary.code, outcome.code);
    assert.equal(historicalBoundary.researchDisposition, 'terminal_unknown_hold');
    assert.equal(boundary, undefined, 'later catalog category correction must supersede the historical wave08 mismatch: ' + outcome.speciesId);
  } else {
    assert.ok(boundary, 'wave08 identity outcome must resolve a boundary: ' + outcome.speciesId);
    assert.equal(boundary.code, outcome.code);
    assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
  }
}

for (const outcome of nextWaveUnified08EvidenceCeilings) {
  const ceiling = getKnowledgeEvidenceCeiling(outcome.speciesId, outcome.field);
  assert.ok(ceiling, 'wave08 exact-species hold must resolve an evidence ceiling: ' + outcome.speciesId);
  assert.equal(ceiling.code, outcome.code);
  assert.equal(ceiling.researchDisposition, 'terminal_unknown_hold');
}

for (const outcome of nextWaveUnified08DomainOutcomes) {
  const boundary = getCompatibilityDomainBoundary(outcome.speciesId);
  assert.ok(boundary, 'wave08 non-fish object must resolve a domain boundary: ' + outcome.speciesId);
  assert.equal(boundary.lifeType, outcome.lifeType);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}

assert.equal(nextWaveUnified08IdentityOutcomes.length, 7);
assert.equal(nextWaveUnified08EvidenceCeilings.length, 17);
assert.equal(nextWaveUnified08DomainOutcomes.length, 1);

const audit = getCompatibilityEvidenceAudit();
assert.equal(audit.reviewedProfiles.length, 111, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);

console.log('Compatibility unified wave08 authority PASS: 0 Profiles, 7 identity/category holds, 17 evidence ceilings, 1 domain hold; DB authority unchanged at 100/176.');
