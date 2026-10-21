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

assert.equal(report.version, 2);
assert.equal(report.summary.heldCatalogObjects, 47);
assert.equal(report.summary.color_only_identity_candidate, 4);
assert.equal(report.summary.morphology_variant, 29);
assert.equal(report.summary.trade_or_lineage_label, 13);
assert.equal(report.summary.size_grade_or_trade_label, 1);
assert.equal(report.summary.missingIdentityReviewCatalogObjects, 47);
assert.equal(report.summary.reviewedSupportedIdentityCatalogObjects, 0);
assert.equal(report.summary.canonicalBridgeCatalogObjects, 0);
assert.equal(report.summary.candidateBaseTaxonClusters, 14);
assert.equal(report.summary.multiObjectCandidateBaseTaxonClusters, 10);
assert.equal(report.items.every(item => item.candidateForAutomaticInheritance === false), true);
assert.equal(report.items.every(item => item.identityReviewState === 'missing'), true);
assert.equal(report.items.every(item => item.canonicalBridgePresent === false), true);
assert.equal(report.items.every(item => item.nextAction === 'review_exact_variant_identity_before_field_research'), true);
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
assert.equal(goldfishCluster?.missingIdentityReviewCatalogObjects, 12);
assert.equal(goldfishCluster?.canonicalBridgeCatalogObjects, 0);
assert.equal(goldfishCluster?.nextAction, 'batch_research_parent_taxon_context_but_require_exact_object_identity_evidence');

const bettaCluster = report.taxonClusters.find(cluster => cluster.candidateBaseScientificName === 'Betta splendens');
assert.equal(bettaCluster?.catalogObjectCount, 7);
assert.deepEqual(bettaCluster?.speciesIds, ['sp_0259','sp_0260','sp_0261','sp_0262','sp_0389','sp_0390','sp_0391']);

console.log('Compatibility variant intake v2 PASS: 47 held objects remain fail-closed, all 47 correctly surface missing exact-object identity review, morphology signals are triage-only, and 14 parent-taxon research clusters replace one-by-one backlog handling without granting shared identity or inheritance.');
