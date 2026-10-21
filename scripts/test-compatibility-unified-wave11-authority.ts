import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { catalogIdentityBoundaries, getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getCatalogCanonicalIdentity, hasFullGenericCompatibilityInheritance } from '../src/data/catalogCanonicalIdentity';
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
  const currentProfile = getReviewedCompatibilityProfile(speciesId);
  if (currentProfile) {
    assert.equal(
      hasFullGenericCompatibilityInheritance(speciesId),
      true,
      'a later static Profile may only supersede frozen Wave11 history through full reviewed canonical inheritance: ' + speciesId,
    );
    assert.equal(getCatalogCanonicalIdentity(speciesId)?.identityStatus, 'reviewed');
  }
}

for (const outcome of nextWaveUnified11IdentityOutcomes) {
  const boundary = getCatalogIdentityBoundary(outcome.speciesId);
  const historicalBoundary = catalogIdentityBoundaries[outcome.speciesId];
  if (getCatalogCanonicalIdentity(outcome.speciesId)?.identityStatus === 'reviewed') {
    assert.ok(historicalBoundary, 'wave11 historical identity hold must remain auditable after canonical identity review: ' + outcome.speciesId);
    assert.equal(historicalBoundary.code, outcome.code);
    assert.equal(historicalBoundary.researchDisposition, 'terminal_unknown_hold');
    assert.equal(boundary, undefined, 'reviewed canonical identity must supersede the historical wave11 hold at runtime: ' + outcome.speciesId);
  } else {
    assert.ok(boundary, 'wave11 identity hold must resolve: ' + outcome.speciesId);
    const refinedTradeNameHold = (
      outcome.code === 'catalog_scientific_name_unresolved'
      && boundary.code === 'trade_name_taxon_ambiguous'
      && boundary.researchDisposition === 'terminal_unknown_hold'
    );
    assert.equal(
      boundary.code === outcome.code || refinedTradeNameHold,
      true,
      'wave11 current identity hold may only preserve the historical code or refine scientific-name uncertainty into a terminal trade-name ambiguity: ' + outcome.speciesId,
    );
    assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
  }
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
assert.ok(audit.reviewedProfiles.length >= 101, 'repository authority must retain the released 101-Profile baseline and may grow beyond it');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);

console.log('Compatibility unified wave11 authority PASS: frozen 0-Profile release remains auditable while only later full canonical inheritance may supersede historical holds at runtime; partial/held objects stay fail-closed.');
