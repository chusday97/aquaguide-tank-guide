import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { plantEnvironmentProfiles } from '../src/data/plantEnvironmentProfiles';
import { speciesEnvironmentProfiles } from '../src/data/speciesEnvironmentProfiles';
import {
  auditPlantEnvironmentProfiles,
  auditSpeciesEnvironmentProfiles,
  getEnvironmentProfileCoverage,
  getReviewedPlantEnvironmentProfile,
  getReviewedSpeciesEnvironmentProfile,
} from '../src/modules/environment/environmentProfileRegistry';
import type { PlantEnvironmentProfile, SpeciesEnvironmentProfile } from '../src/modules/environment/environment.types';

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
  'missing reviewed species knowledge must remain unavailable instead of being inferred',
);

const reviewedJavaFern = getReviewedPlantEnvironmentProfile('sp_0081');
assert.ok(reviewedJavaFern, 'reviewed Microsorum pteropus profile should be available');
assert.equal(reviewedJavaFern.environment.light, 'low');
assert.equal(reviewedJavaFern.environment.co2, 'optional');
assert.equal(reviewedJavaFern.planting.type, 'epiphyte');
assert.equal(reviewedJavaFern.planting.substrateRequired, 'none');
assert.equal(reviewedJavaFern.planting.leafDurability, 'tough');
assert.ok(reviewedJavaFern.evidence.sourceRefs.length >= 2);
assert.equal(
  getReviewedPlantEnvironmentProfile('plant-without-reviewed-profile'),
  null,
  'missing reviewed plant knowledge must remain unavailable instead of being inferred',
);

const javaFernCatalog = fishData.find(item => item.id === 'sp_0081');
assert.ok(javaFernCatalog, 'reviewed plant profile must resolve to a catalog record');
assert.equal(javaFernCatalog.scientificName, 'Microsorum pteropus');
assert.equal(
  javaFernCatalog.category,
  '水草',
  'reviewed Microsorum pteropus must not remain misclassified as fish in the legacy catalog',
);
assert.equal(
  javaFernCatalog.feedingProfile?.dietType,
  'Autotroph',
  'reviewed plant must not retain the legacy carnivore feeding fallback',
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

const invalidPlantProfile: PlantEnvironmentProfile = {
  speciesId: 'synthetic-invalid-plant',
  environment: { waterType: 'freshwater' },
  planting: { type: 'unknown' },
  evidence: {
    confidence: 'high',
    reviewStatus: 'reviewed',
    sourceRefs: ['missing-source'],
  },
};
const invalidPlantIssues = auditPlantEnvironmentProfiles([invalidPlantProfile]);
assert.ok(invalidPlantIssues.some(issue => issue.code === 'unknown_planting_type'));
assert.ok(invalidPlantIssues.some(issue => issue.code === 'reviewed_without_sources'));
assert.ok(invalidPlantIssues.some(issue => issue.code === 'missing_evidence_source'));

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

const productionAuditIssues = [
  ...auditSpeciesEnvironmentProfiles(speciesEnvironmentProfiles),
  ...auditPlantEnvironmentProfiles(plantEnvironmentProfiles),
];
assert.deepEqual(productionAuditIssues, [], `production environment profiles must pass evidence audit: ${JSON.stringify(productionAuditIssues)}`);

const coverage = getEnvironmentProfileCoverage();
assert.equal(coverage.totalProfiles, 2);
assert.equal(coverage.reviewedProfiles, 2);
assert.equal(coverage.speciesTotalProfiles, 1);
assert.equal(coverage.speciesReviewedProfiles, 1);
assert.equal(coverage.plantTotalProfiles, 1);
assert.equal(coverage.plantReviewedProfiles, 1);
assert.deepEqual(coverage.auditIssues, []);

console.log('Environment profile registry regression: PASS (species + plant review gates, catalog identity, evidence resolution, fail-closed lookup).');
