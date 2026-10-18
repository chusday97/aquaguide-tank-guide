import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCompatibilityDomainBoundary } from '../src/data/compatibilityDomainBoundaries';
import { getKnowledgeEvidenceCeiling } from '../src/data/knowledgeEvidenceCeilings';
import { getReviewedCompatibilityProfile, getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilitySourceControlledPendingProfileIds, compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import {
  nextWaveUnified16AllSpeciesIds,
  nextWaveUnified16DomainOutcomes,
  nextWaveUnified16EvidenceCeilings,
  nextWaveUnified16ProfileIds,
  nextWaveUnified16Sources,
} from '../src/data/catalogReviewBatches/next-wave-unified-16';

const batch = compatibilityUnifiedNextWave.releasedBatches.find(item => item.batchId === 'unified-wave16-20261013');
assert.ok(batch);
assert.equal(batch.authorityOwner, 'src/data/catalogReviewBatches/next-wave-unified-16.ts');
assert.equal(batch.migrationOwner, 'supabase/migrations/20261013153000_compatibility_unified_wave16_authority.sql');
assert.equal(batch.members.length, 12);
assert.deepEqual(batch.members.map(item => item.speciesId), [...nextWaveUnified16AllSpeciesIds]);
assert.deepEqual(batch.members.filter(item => item.expectProfile).map(item => item.speciesId), [...nextWaveUnified16ProfileIds]);

const authority = readFileSync(batch.authorityOwner, 'utf8');
for (const speciesId of nextWaveUnified16AllSpeciesIds) assert.equal(authority.includes(speciesId), true);

const profile = getReviewedCompatibilityProfile('sp_0052');
assert.ok(profile);
assert.equal(profile.waterType, 'freshwater');
assert.deepEqual(profile.behaviorTraits, ['shoaling', 'bottom_dwelling']);
assert.equal(profile.minimumGroupSize, undefined, 'review must not invent a numeric group minimum');
assert.deepEqual(profile.predationTargets, ['fish_fry'], 'current profile may gain later direct fry-predation authority without mutating the historical Unified Wave16 release');
assert.equal(profile.confidence, 'medium');
for (const requiredFact of ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'] as const) {
  assert.ok(profile.requiredFacts.includes(requiredFact), 'current sp_0052 profile must retain Wave16 required fact ' + requiredFact);
}
assert.ok(
  profile.citations.some(item => item.id === nextWaveUnified16Sources.corydorasHastatusFishBase.id),
  'current sp_0052 profile must retain the Wave16 FishBase source when later reviewed authority grows the profile',
);

for (const outcome of nextWaveUnified16EvidenceCeilings) {
  const laterSourceControlledProfile = (compatibilitySourceControlledPendingProfileIds as readonly string[]).includes(outcome.speciesId);
  if (laterSourceControlledProfile) {
    assert.ok(
      getReviewedCompatibilityProfile(outcome.speciesId),
      'later reviewed exact-taxon behavior evidence may add a Profile without rewriting frozen Wave16 history: ' + outcome.speciesId,
    );
  } else {
    assert.equal(getReviewedCompatibilityProfile(outcome.speciesId), undefined);
  }
  const ceiling = getKnowledgeEvidenceCeiling(outcome.speciesId, outcome.field);
  assert.ok(ceiling);
  assert.equal(ceiling.code, outcome.code);
  assert.equal(ceiling.researchDisposition, 'terminal_unknown_hold');
}
for (const outcome of nextWaveUnified16DomainOutcomes) {
  assert.equal(getReviewedCompatibilityProfile(outcome.speciesId), undefined);
  const boundary = getCompatibilityDomainBoundary(outcome.speciesId);
  assert.ok(boundary);
  assert.equal(boundary.lifeType, outcome.lifeType);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}

const audit = getCompatibilityEvidenceAudit();
assert.equal(audit.reviewedProfiles.length, 124, 'repository authority may grow beyond the released 101-Profile rollout target');
assert.equal(audit.reviewedPairRules.length, 21);
assert.equal(audit.reviewedStageRiskProfiles.length, 1);

console.log('Compatibility unified wave16 authority PASS: frozen 1-Profile release plus 2 historical social evidence ceilings remain auditable while later reviewed behavior authority may supersede them at runtime.');
