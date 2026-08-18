import assert from 'node:assert/strict';
import { speciesEnvironmentProfiles } from '../src/data/speciesEnvironmentProfiles';
import {
  auditSpeciesEnvironmentProfiles,
  getEnvironmentProfileCoverage,
  getReviewedSpeciesEnvironmentProfile,
} from '../src/modules/environment/environmentProfileRegistry';
import type { SpeciesEnvironmentProfile } from '../src/modules/environment/environment.types';

const reviewedSewellia = getReviewedSpeciesEnvironmentProfile('sp_0045');
assert.ok(reviewedSewellia, 'reviewed Sewellia profile should be available');
assert.equal(reviewedSewellia.environment.waterType, 'freshwater');
assert.equal(reviewedSewellia.environment.oxygenDemand, 'high');
assert.equal(reviewedSewellia.environment.flowPreference, 'high');
assert.ok(
  reviewedSewellia.evidence.sourceRefs.length >= 2,
  'reviewed profile must preserve multiple evidence references',
);

assert.equal(
  getReviewedSpeciesEnvironmentProfile('species-without-reviewed-profile'),
  null,
  'missing reviewed knowledge must remain unavailable instead of being inferred',
);

const invalidReviewedProfile: SpeciesEnvironmentProfile = {
  speciesId: 'synthetic-invalid-reviewed',
  environment: { temperature: { min: 28, max: 22 } },
  evidence: {
    confidence: 'low',
    reviewStatus: 'reviewed',
    sourceRefs: ['missing-source'],
  },
};
const invalidIssues = auditSpeciesEnvironmentProfiles([invalidReviewedProfile]);
assert.ok(invalidIssues.some(issue => issue.code === 'invalid_range'));
assert.ok(invalidIssues.some(issue => issue.code === 'reviewed_without_sources'));
assert.ok(invalidIssues.some(issue => issue.code === 'reviewed_with_weak_confidence'));
assert.ok(invalidIssues.some(issue => issue.code === 'missing_evidence_source'));

const draftWithoutSources: SpeciesEnvironmentProfile = {
  speciesId: 'synthetic-draft',
  environment: { waterType: 'freshwater' },
  evidence: {
    confidence: 'unknown',
    reviewStatus: 'draft',
    sourceRefs: [],
  },
};
assert.deepEqual(
  auditSpeciesEnvironmentProfiles([draftWithoutSources]),
  [],
  'draft knowledge may remain incomplete but must never be exposed as reviewed',
);

const productionAuditIssues = auditSpeciesEnvironmentProfiles(speciesEnvironmentProfiles);
assert.deepEqual(productionAuditIssues, [], `production environment profiles must pass evidence audit: ${JSON.stringify(productionAuditIssues)}`);

const coverage = getEnvironmentProfileCoverage();
assert.equal(coverage.totalProfiles, 1);
assert.equal(coverage.reviewedProfiles, 1);
assert.deepEqual(coverage.auditIssues, []);

console.log('Environment profile registry regression: PASS (review gate + evidence resolution + fail-closed lookup).');
