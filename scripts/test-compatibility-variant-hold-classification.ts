import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildCompatibilityVariantHoldClassification,
  classifyCompatibilityVariantHold,
} from '../src/services/compatibility/compatibility-variant-hold-classification.service';

const report = buildCompatibilityVariantHoldClassification();
const disk = JSON.parse(readFileSync(resolve(process.cwd(), 'docs/compatibility_variant_hold_classification.json'), 'utf8'));
assert.deepEqual(disk, report, 'variant hold classification artifact must stay generated from current coverage');

assert.equal(report.summary.heldCatalogObjects, 47);
assert.equal(report.summary.color_only_identity_candidate, 4);
assert.equal(report.summary.morphology_variant, 29);
assert.equal(report.summary.trade_or_lineage_label, 13);
assert.equal(report.summary.size_grade_or_trade_label, 1);
assert.equal(report.items.every(item => item.candidateForAutomaticInheritance === false), true);
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

const colorIds = report.items
  .filter(item => item.classification === 'color_only_identity_candidate')
  .map(item => item.speciesId);
assert.deepEqual(colorIds, [
  'sp_0168','sp_0213','sp_0252','sp_0254',
]);

for (const id of ['sp_0153','sp_0172','sp_0203','sp_0215','sp_0233','sp_0292','sp_0293','sp_0295','sp_0389','sp_0395','sp_0413','sp_0419']) {
  assert.equal(report.items.find(item => item.speciesId === id)?.classification, 'morphology_variant');
}

console.log('Compatibility variant hold classification PASS: 47 held objects are structurally triaged into 4 color-only identity candidates / 29 morphology variants / 13 trade-lineage labels / 1 size-grade label, without granting inheritance.');
