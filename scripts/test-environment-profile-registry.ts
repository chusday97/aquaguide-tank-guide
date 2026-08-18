import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { plantEnvironmentProfiles } from '../src/data/plantEnvironmentProfiles';
import { speciesEnvironmentProfiles } from '../src/data/speciesEnvironmentProfiles';
import { isAquaticPlantSpecies } from '../src/lib/speciesClassification';
import { buildSpeciesCarePresentation } from '../src/modules/knowledge/speciesCarePresentation';
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
assert.ok((reviewedSewellia.evidence.claimRefs?.['environment.flowPreference'] || []).length >= 2);

const reviewedNeon = getReviewedSpeciesEnvironmentProfile('sp_0431');
assert.ok(reviewedNeon, 'reviewed Paracheirodon innesi profile should be available');
assert.equal(reviewedNeon.environment.waterType, 'freshwater');
assert.deepEqual(reviewedNeon.environment.temperature, { min: 20, max: 26 });
assert.equal(reviewedNeon.environment.minimumTankLengthCm, 60);
assert.equal(
  reviewedNeon.environment.ph,
  undefined,
  'reviewed Neon tetra profile must not collapse conflicting pH upper bounds into fake precision',
);
assert.equal((reviewedNeon.evidence.claimRefs?.['environment.temperature'] || []).length, 2);

const reviewedHarlequin = getReviewedSpeciesEnvironmentProfile('sp_0468');
assert.ok(reviewedHarlequin, 'reviewed Trigonostigma heteromorpha profile should be available');
assert.equal(reviewedHarlequin.environment.waterType, 'freshwater');
assert.deepEqual(reviewedHarlequin.environment.ph, { min: 5, max: 7 });
assert.equal(reviewedHarlequin.environment.minimumTankLengthCm, 60);
assert.equal(
  reviewedHarlequin.environment.temperature,
  undefined,
  'reviewed Harlequin rasbora profile must not collapse 22-25 C and 22-26 C source ranges into fake precision',
);
assert.equal((reviewedHarlequin.evidence.claimRefs?.['environment.ph'] || []).length, 2);

assert.equal(
  getReviewedSpeciesEnvironmentProfile('species-without-reviewed-profile'),
  null,
  'missing reviewed species knowledge must remain unavailable instead of being inferred',
);

const reviewedJavaFern = getReviewedPlantEnvironmentProfile('sp_0081');
assert.ok(reviewedJavaFern, 'reviewed Microsorum pteropus profile should be available');
assert.equal(reviewedJavaFern.environment.light, 'low');
assert.equal(reviewedJavaFern.environment.co2, 'optional');
assert.equal(reviewedJavaFern.environment.waterType, undefined);
assert.equal(reviewedJavaFern.planting.type, 'epiphyte');
assert.equal(reviewedJavaFern.planting.substrateRequired, 'none');
assert.equal(reviewedJavaFern.planting.leafDurability, 'tough');
assert.ok(reviewedJavaFern.evidence.sourceRefs.length >= 2);

const reviewedDwarfBabyTears = getReviewedPlantEnvironmentProfile('sp_0071');
assert.ok(reviewedDwarfBabyTears, 'reviewed dwarf baby tears profile should be available');
assert.equal(reviewedDwarfBabyTears.environment.light, 'high');
assert.equal(reviewedDwarfBabyTears.environment.co2, 'recommended');
assert.equal(reviewedDwarfBabyTears.planting.type, 'rooted');
assert.equal(
  reviewedDwarfBabyTears.planting.substrateRequired,
  undefined,
  'reviewed profile must not invent a substrate material when sources only establish rooted carpeting growth',
);
assert.ok(reviewedDwarfBabyTears.evidence.sourceRefs.length >= 2);

const reviewedAnubias = getReviewedPlantEnvironmentProfile('sp_0075');
assert.ok(reviewedAnubias, 'reviewed Anubias nana profile should be available');
assert.equal(reviewedAnubias.environment.light, 'low');
assert.equal(reviewedAnubias.environment.co2, 'optional');
assert.equal(reviewedAnubias.planting.type, 'epiphyte');
assert.equal(reviewedAnubias.planting.substrateRequired, 'none');
assert.equal(reviewedAnubias.planting.leafDurability, 'tough');
assert.ok(reviewedAnubias.evidence.sourceRefs.length >= 2);

assert.equal(
  getReviewedPlantEnvironmentProfile('plant-without-reviewed-profile'),
  null,
  'missing reviewed plant knowledge must remain unavailable instead of being inferred',
);

const javaFernCatalog = fishData.find(item => item.id === 'sp_0081');
assert.ok(javaFernCatalog, 'reviewed plant profile must resolve to a catalog record');
assert.equal(javaFernCatalog.scientificName, 'Microsorum pteropus');
assert.equal(
  isAquaticPlantSpecies(javaFernCatalog),
  true,
  'legacy catalog anomalies must still classify Microsorum pteropus as a plant before presentation',
);
const javaFernCare = buildSpeciesCarePresentation(javaFernCatalog);
assert.equal(javaFernCare.sourceStatus, 'verified');
assert.equal(javaFernCare.sourceLabel, '已核验植物资料');
assert.equal(javaFernCare.feedingItems.length, 0, 'plant care must not expose animal feeding fallback fields');
assert.ok(javaFernCare.environmentItems.some(item => item.label === '光照'));
assert.ok(javaFernCare.environmentItems.some(item => item.label === 'CO₂'));
assert.ok(javaFernCare.environmentItems.some(item => item.label === '种植方式'));
assert.ok(javaFernCare.environmentItems.some(item => item.label === '底床'));
assert.doesNotMatch(
  JSON.stringify(javaFernCare),
  /冻虾|鱼肉|高蛋白肉食|投喂频率/,
  'reviewed plant presentation must not leak the legacy carnivore feeding template',
);

const dwarfBabyTearsCatalog = fishData.find(item => item.id === 'sp_0071');
assert.ok(dwarfBabyTearsCatalog && isAquaticPlantSpecies(dwarfBabyTearsCatalog));
const dwarfBabyTearsCare = buildSpeciesCarePresentation(dwarfBabyTearsCatalog);
assert.equal(dwarfBabyTearsCare.sourceStatus, 'verified');
assert.equal(dwarfBabyTearsCare.feedingItems.length, 0);
assert.ok(dwarfBabyTearsCare.environmentItems.some(item => item.label === '光照' && item.value === '高光'));
assert.ok(dwarfBabyTearsCare.environmentItems.some(item => item.label === 'CO₂' && item.value.includes('建议')));
assert.ok(dwarfBabyTearsCare.environmentItems.some(item => item.label === '种植方式' && item.value.includes('扎根')));
assert.equal(
  dwarfBabyTearsCare.environmentItems.some(item => item.label === '底床'),
  false,
  'unsourced substrate material must stay absent from the reviewed presentation',
);

const anubiasCatalog = fishData.find(item => item.id === 'sp_0075');
assert.ok(anubiasCatalog && isAquaticPlantSpecies(anubiasCatalog));
const anubiasCare = buildSpeciesCarePresentation(anubiasCatalog);
assert.equal(anubiasCare.sourceStatus, 'verified');
assert.equal(anubiasCare.feedingItems.length, 0);
assert.ok(anubiasCare.environmentItems.some(item => item.label === '光照' && item.value === '低光'));
assert.ok(anubiasCare.environmentItems.some(item => item.label === 'CO₂' && item.value.includes('可选')));
assert.ok(anubiasCare.environmentItems.some(item => item.label === '种植方式' && item.value.includes('附生')));
assert.ok(anubiasCare.environmentItems.some(item => item.label === '底床' && item.value.includes('不依赖')));

const unreviewedPlantCatalog = fishData.find(item => item.id === 'sp_0080');
assert.ok(unreviewedPlantCatalog && isAquaticPlantSpecies(unreviewedPlantCatalog));
const unreviewedPlantCare = buildSpeciesCarePresentation(unreviewedPlantCatalog);
assert.equal(unreviewedPlantCare.sourceStatus, 'pending');
assert.equal(unreviewedPlantCare.feedingItems.length, 0);
assert.equal(
  unreviewedPlantCare.hasStructuredProfile,
  false,
  'unreviewed plants must remain fail-closed rather than reusing legacy feeding data',
);

const missingClaimProfile: SpeciesEnvironmentProfile = {
  speciesId: 'synthetic-missing-claim',
  environment: { waterType: 'freshwater' },
  evidence: {
    confidence: 'medium',
    reviewStatus: 'reviewed',
    sourceRefs: [
      'sewellia-lineolata-fishbase-40433',
      'sewellia-lineolata-fishkeeper',
    ],
  },
};
const missingClaimIssues = auditSpeciesEnvironmentProfiles([missingClaimProfile]);
assert.ok(
  missingClaimIssues.some(issue => issue.code === 'missing_claim_evidence'),
  'reviewed explicit traits without claim-level evidence must fail audit',
);

const orphanClaimProfile: SpeciesEnvironmentProfile = {
  speciesId: 'synthetic-orphan-claim',
  environment: { waterType: 'freshwater' },
  evidence: {
    confidence: 'medium',
    reviewStatus: 'reviewed',
    sourceRefs: [
      'sewellia-lineolata-fishbase-40433',
      'sewellia-lineolata-fishkeeper',
    ],
    claimRefs: {
      'environment.waterType': ['sewellia-lineolata-fishbase-40433'],
      'environment.temperature': ['sewellia-lineolata-fishbase-40433'],
    },
  },
};
assert.ok(
  auditSpeciesEnvironmentProfiles([orphanClaimProfile]).some(issue => issue.code === 'orphan_claim_evidence'),
  'evidence for a trait not exposed by the profile must fail audit',
);

const highConfidenceSingleSourceClaim: SpeciesEnvironmentProfile = {
  speciesId: 'synthetic-high-single-source',
  environment: { waterType: 'freshwater' },
  evidence: {
    confidence: 'high',
    reviewStatus: 'reviewed',
    sourceRefs: [
      'sewellia-lineolata-fishbase-40433',
      'sewellia-lineolata-fishkeeper',
    ],
    claimRefs: {
      'environment.waterType': ['sewellia-lineolata-fishbase-40433'],
    },
  },
};
assert.ok(
  auditSpeciesEnvironmentProfiles([highConfidenceSingleSourceClaim]).some(issue => issue.code === 'high_confidence_single_source_claim'),
  'high-confidence reviewed claims must be independently corroborated',
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
assert.ok(invalidIssues.some(issue => issue.code === 'missing_claim_evidence'));

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
assert.ok(invalidPlantIssues.some(issue => issue.code === 'missing_claim_evidence'));

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
assert.equal(coverage.totalProfiles, 6);
assert.equal(coverage.reviewedProfiles, 6);
assert.equal(coverage.speciesTotalProfiles, 3);
assert.equal(coverage.speciesReviewedProfiles, 3);
assert.equal(coverage.plantTotalProfiles, 3);
assert.equal(coverage.plantReviewedProfiles, 3);
assert.deepEqual(coverage.auditIssues, []);

console.log('Environment profile registry regression: PASS (trait provenance + species/plant review gates + safe plant presentation + fail-closed lookup).');
