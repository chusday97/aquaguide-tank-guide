import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildCompatibilityVariantHoldClassification,
  classifyCompatibilityVariantHold,
  detectVariantMorphologySignals,
  extractVariantBaseTaxonCandidate,
} from '../src/services/compatibility/compatibility-variant-hold-classification.service';

const report = buildCompatibilityVariantHoldClassification();
const disk = JSON.parse(readFileSync(resolve(process.cwd(), 'docs/compatibility_variant_hold_classification.json'), 'utf8'));
assert.deepEqual(disk, report, 'variant hold classification artifact must stay generated from current coverage');

assert.equal(report.version, 3);
assert.equal(report.summary.heldCatalogObjects, 47);
assert.equal(report.summary.color_only_identity_candidate, 4);
assert.equal(report.summary.morphology_variant, 29);
assert.equal(report.summary.trade_or_lineage_label, 13);
assert.equal(report.summary.size_grade_or_trade_label, 1);
assert.equal(report.summary.missingIdentityReviewCatalogObjects, 41);
assert.equal(report.summary.reviewedSupportedIdentityCatalogObjects, 6);
assert.equal(report.summary.canonicalBridgeCatalogObjects, 6);
assert.equal(report.summary.fieldResearchPolicyCatalogObjects, 6);
assert.deepEqual(report.summary.pipelineStages, {
  identity_review_pending: 41,
  identity_evidence_ceiling: 0,
  canonical_bridge_pending: 0,
  field_policy_pending: 0,
  field_review_pending: 6,
});
assert.equal(report.summary.candidateBaseTaxonClusters, 14);
assert.equal(report.summary.multiObjectCandidateBaseTaxonClusters, 10);
assert.equal(report.items.every(item => item.candidateForAutomaticInheritance === false), true);
const reviewedGoldfishIdentityIds = ['sp_0063', 'sp_0149', 'sp_0180', 'sp_0348', 'sp_0351', 'sp_0386'];
const reviewedGoldfishItems = report.items.filter(item => reviewedGoldfishIdentityIds.includes(item.speciesId));
assert.equal(reviewedGoldfishItems.length, 6);
assert.equal(reviewedGoldfishItems.every(item => item.identityReviewState === 'reviewed_supported'), true);
assert.equal(reviewedGoldfishItems.every(item => item.canonicalBridgePresent === true), true);
assert.equal(reviewedGoldfishItems.every(item => item.researchPolicyPresent === true), true);
assert.equal(reviewedGoldfishItems.every(item => item.pipelineStage === 'field_review_pending'), true);
assert.equal(reviewedGoldfishItems.every(item => item.nextAction === 'execute_reviewed_field_research_policy_without_granting_inheritance'), true);
assert.equal(reviewedGoldfishItems.every(item => item.activeFieldReviewFields.length === 1 && item.activeFieldReviewFields[0] === 'predation'), true);
assert.equal(reviewedGoldfishItems.every(item => item.deferredFieldReviewFields.length === 7), true);
const stillMissingIdentityItems = report.items.filter(item => !reviewedGoldfishIdentityIds.includes(item.speciesId));
assert.equal(stillMissingIdentityItems.length, 41);
assert.equal(stillMissingIdentityItems.every(item => item.identityReviewState === 'missing'), true);
assert.equal(stillMissingIdentityItems.every(item => item.canonicalBridgePresent === false), true);
assert.equal(stillMissingIdentityItems.every(item => item.researchPolicyPresent === false), true);
assert.equal(stillMissingIdentityItems.every(item => item.pipelineStage === 'identity_review_pending'), true);
assert.equal(stillMissingIdentityItems.every(item => item.activeFieldReviewFields.length === 0), true);
assert.equal(stillMissingIdentityItems.every(item => item.deferredFieldReviewFields.length === 0), true);
assert.equal(stillMissingIdentityItems.every(item => item.nextAction === 'review_exact_variant_identity_before_field_research'), true);
assert.equal(report.policy.parsedBaseTaxonIsCandidateOnly, true);
assert.equal(report.policy.morphologySignalsAreTriageOnly, true);
assert.equal(report.policy.exactObjectIdentityEvidenceRequired, true);
assert.equal(report.policy.clusterResearchNeverGrantsSharedVariantIdentity, true);
assert.equal(report.policy.pairPrecomputationRequired, false);

assert.equal(classifyCompatibilityVariantHold('Crossocheilus langei var. Gold Longfin', '黄金大帆飞狐'), 'morphology_variant');
assert.equal(classifyCompatibilityVariantHold('Poecilia latipinna var. Gold', '金玛丽'), 'color_only_identity_candidate');
assert.equal(classifyCompatibilityVariantHold('Synchiropus splendidus var. XL', '五彩青蛙 (大规格改良)'), 'size_grade_or_trade_label');
assert.equal(classifyCompatibilityVariantHold('Danio rerio var. GloFish', '荧光斑马鱼'), 'trade_or_lineage_label');
assert.equal(classifyCompatibilityVariantHold('Betta splendens var. Platinum', '白金半月斗鱼'), 'morphology_variant');
assert.equal(classifyCompatibilityVariantHold('Poecilia sphenops var. Green', '绿赏皮球'), 'morphology_variant');
assert.equal(classifyCompatibilityVariantHold('Poecilia sphenops var. Chocolate', '巧克力皮球'), 'morphology_variant');
assert.equal(classifyCompatibilityVariantHold('Amatitlania nigrofasciata var. Blue', '蓝宝鹦鹉鱼'), 'trade_or_lineage_label');
assert.equal(classifyCompatibilityVariantHold('Amatitlania nigrofasciata var. White', '雪玉鹦鹉鱼'), 'trade_or_lineage_label');
assert.equal(extractVariantBaseTaxonCandidate('Danio rerio var. Glo Orange Longfin'), 'Danio rerio');
assert.deepEqual(detectVariantMorphologySignals('Betta splendens var. Halfmoon', '半月斗鱼'), ['fin_shape']);
assert.deepEqual(detectVariantMorphologySignals('Trichopodus leerii var. Balloon', '球形珍珠马甲'), ['body_shape']);
assert.deepEqual(
  detectVariantMorphologySignals('Carassius auratus var. Black Moor', '黑金刚龙睛'),
  ['body_shape', 'head_or_eye_structure'],
);

const colorIds = report.items
  .filter(item => item.classification === 'color_only_identity_candidate')
  .map(item => item.speciesId);
assert.deepEqual(colorIds, [
  'sp_0168','sp_0213','sp_0252','sp_0254',
]);

for (const id of ['sp_0153','sp_0172','sp_0203','sp_0215','sp_0233','sp_0292','sp_0293','sp_0295','sp_0389','sp_0395','sp_0413','sp_0419']) {
  assert.equal(report.items.find(item => item.speciesId === id)?.classification, 'morphology_variant');
}

const whitePlatinumHalfmoon = report.items.find(item => item.speciesId === 'sp_0389');
assert.deepEqual(whitePlatinumHalfmoon?.morphologySignals, ['fin_shape']);
assert.equal(whitePlatinumHalfmoon?.compoundVariantLabel, true);
assert.equal(whitePlatinumHalfmoon?.candidateBaseScientificName, 'Betta splendens');

const goldfishCluster = report.taxonClusters.find(cluster => cluster.candidateBaseScientificName === 'Carassius auratus');
assert.equal(goldfishCluster?.catalogObjectCount, 12);
assert.equal(goldfishCluster?.missingIdentityReviewCatalogObjects, 6);
assert.equal(goldfishCluster?.reviewedSupportedIdentityCatalogObjects, 6);
assert.equal(goldfishCluster?.canonicalBridgeCatalogObjects, 6);
assert.deepEqual(goldfishCluster?.pipelineStages, {
  identity_review_pending: 6,
  identity_evidence_ceiling: 0,
  canonical_bridge_pending: 0,
  field_policy_pending: 0,
  field_review_pending: 6,
});
assert.equal(goldfishCluster?.nextAction, 'batch_exact_object_identity_review_with_parent_taxon_context');

const bettaCluster = report.taxonClusters.find(cluster => cluster.candidateBaseScientificName === 'Betta splendens');
assert.equal(bettaCluster?.catalogObjectCount, 7);
assert.deepEqual(bettaCluster?.speciesIds, ['sp_0259','sp_0260','sp_0261','sp_0262','sp_0389','sp_0390','sp_0391']);
assert.deepEqual(bettaCluster?.pipelineStages, {
  identity_review_pending: 7,
  identity_evidence_ceiling: 0,
  canonical_bridge_pending: 0,
  field_policy_pending: 0,
  field_review_pending: 0,
});

assert.deepEqual(report.stageQueue.map(stage => [stage.stage, stage.catalogObjectCount]), [
  ['identity_review_pending', 41],
  ['field_review_pending', 6],
]);
const identityQueue = report.stageQueue.find(stage => stage.stage === 'identity_review_pending');
assert.equal(identityQueue?.parentTaxonBatches[0]?.candidateBaseScientificName, 'Carassius auratus');
assert.equal(identityQueue?.parentTaxonBatches[0]?.catalogObjectCount, 6);
assert.equal(identityQueue?.parentTaxonBatches[1]?.candidateBaseScientificName, 'Betta splendens');
assert.equal(identityQueue?.parentTaxonBatches[1]?.catalogObjectCount, 7);
const fieldQueue = report.stageQueue.find(stage => stage.stage === 'field_review_pending');
assert.deepEqual(fieldQueue?.parentTaxonBatches, [{
  candidateBaseScientificName: 'Carassius auratus',
  catalogObjectCount: 6,
  reviewedSupportedIdentityContext: 6,
  canonicalBridgeContext: 6,
  speciesIds: reviewedGoldfishIdentityIds,
}]);

console.log('Compatibility variant intake v3 PASS: 47 held objects remain fail-closed and are now staged into 41 identity-review pending plus 6 field-review pending objects; stage queues batch work by parent taxon without granting shared identity, field authority, or pair rules.');
