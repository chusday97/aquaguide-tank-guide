import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { catalogIdentityBoundaries, getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getCatalogCanonicalIdentity, hasFullGenericCompatibilityInheritance } from '../src/data/catalogCanonicalIdentity';
import { getCompatibilityDomainBoundary } from '../src/data/compatibilityDomainBoundaries';
import { getKnowledgeEvidenceCeiling } from '../src/data/knowledgeEvidenceCeilings';
import { getReviewedCompatibilityProfile, getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import {
  nextWaveUnified14AllSpeciesIds,
  nextWaveUnified14DomainOutcomes,
  nextWaveUnified14EvidenceCeilings,
  nextWaveUnified14IdentityOutcomes,
} from '../src/data/catalogReviewBatches/next-wave-unified-14';

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave14-20261012');
assert.ok(batch);
assert.equal(batch.migrationOwner, undefined, 'hold-only wave14 must not invent a DB migration');
assert.equal(batch.authorityOwner, 'src/data/catalogReviewBatches/next-wave-unified-14.ts');
assert.equal(batch.members.length, 25, 'all 25 queued objects must be classified atomically');
assert.equal(batch.members.filter(item => item.expectProfile).length, 0);
assert.deepEqual(batch.members.map(item => item.speciesId), [...nextWaveUnified14AllSpeciesIds]);

const authority = readFileSync(batch.authorityOwner, 'utf8');
for (const speciesId of nextWaveUnified14AllSpeciesIds) {
  assert.equal(authority.includes(speciesId), true);
  const currentProfile = getReviewedCompatibilityProfile(speciesId);
  if (currentProfile) {
    assert.equal(
      hasFullGenericCompatibilityInheritance(speciesId),
      true,
      'a later static Profile may only supersede frozen Wave14 history through full reviewed canonical inheritance: ' + speciesId,
    );
    assert.equal(getCatalogCanonicalIdentity(speciesId)?.identityStatus, 'reviewed');
  }
}
for (const outcome of nextWaveUnified14IdentityOutcomes) {
  const boundary = getCatalogIdentityBoundary(outcome.speciesId);
  const historicalBoundary = catalogIdentityBoundaries[outcome.speciesId];
  if (getCatalogCanonicalIdentity(outcome.speciesId)?.identityStatus === 'reviewed') {
    assert.ok(historicalBoundary, 'wave14 historical identity hold must remain auditable after canonical identity review: ' + outcome.speciesId);
    assert.equal(historicalBoundary.code, outcome.code);
    assert.equal(historicalBoundary.researchDisposition, 'terminal_unknown_hold');
    assert.equal(boundary, undefined, 'reviewed canonical identity must supersede the historical wave14 hold at runtime: ' + outcome.speciesId);
  } else {
    assert.ok(boundary, 'wave14 identity hold must resolve: ' + outcome.speciesId);
    const refinedTradeNameHold = (
      outcome.code === 'catalog_scientific_name_unresolved'
      && boundary.code === 'trade_name_taxon_ambiguous'
      && boundary.researchDisposition === 'terminal_unknown_hold'
    );
    assert.equal(
      boundary.code === outcome.code || refinedTradeNameHold,
      true,
      'wave14 current identity hold may only preserve the historical code or refine scientific-name uncertainty into a terminal trade-name ambiguity: ' + outcome.speciesId,
    );
    assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
  }
}
for (const outcome of nextWaveUnified14EvidenceCeilings) {
  const ceiling = getKnowledgeEvidenceCeiling(outcome.speciesId, outcome.field);
  assert.ok(ceiling, 'wave14 variant hold must resolve an evidence ceiling: ' + outcome.speciesId);
  assert.equal(ceiling.code, outcome.code);
  assert.equal(ceiling.researchDisposition, 'terminal_unknown_hold');
}
for (const outcome of nextWaveUnified14DomainOutcomes) {
  const boundary = getCompatibilityDomainBoundary(outcome.speciesId);
  assert.ok(boundary, 'wave14 shrimp object must resolve a domain hold: ' + outcome.speciesId);
  assert.equal(boundary.lifeType, outcome.lifeType);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}
assert.equal(nextWaveUnified14IdentityOutcomes.length, 8);
assert.equal(nextWaveUnified14EvidenceCeilings.length, 13);
assert.equal(nextWaveUnified14DomainOutcomes.length, 4);

const audit = getCompatibilityEvidenceAudit();
assert.ok(audit.reviewedProfiles.length >= 101, 'repository authority must retain the released 101-Profile baseline and may grow beyond it');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);

console.log('Compatibility unified wave14 authority PASS: 0 Profiles, 8 identity holds, 13 variant evidence ceilings, 4 shrimp domain holds; DB authority unchanged at 100/176.');
