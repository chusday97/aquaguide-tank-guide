import assert from 'node:assert/strict';
import { buildContentImpact } from '../src/services/admin/content-impact.service';
import type { CareArticleAdminInput, SpeciesAdminInput } from '../src/services/admin/content-admin.service';

const species: SpeciesAdminInput = {
  catalogKey: 'sp_demo', name: '测试灯鱼', scientificName: 'Demo tetra', category: '小型鱼', difficulty: 'Easy',
  waterTemperatureText: '22-26°C', phLevelText: '6.5-7.5', waterChangeCycleDays: 7,
  description: '测试说明', diet: '少量多次', tankSizeText: '至少 30 升', temperament: 'Peaceful',
  sizeClass: 'Small', housingMode: '适合混养', housingReason: '温和混养', isCustom: false, searchTerms: [],
};

const display = buildContentImpact('species', species, { ...species, name: '新名字' });
assert.equal(display.highestKind, 'display_only');
assert.deepEqual(display.directConsumers, ['encyclopedia']);
assert.ok(display.reviewConsumers.includes('search_collection'));
assert.ok(display.reviewConsumers.includes('seo'));
assert.ok(!display.reviewConsumers.includes('compatibility'));

const critical = buildContentImpact('species', species, { ...species, phLevelText: '7.0-8.0' });
assert.equal(critical.highestKind, 'decision_critical_product');
assert.ok(critical.directConsumers.includes('encyclopedia'));
assert.ok(critical.reviewConsumers.includes('aquarium'));
assert.ok(critical.reviewConsumers.includes('compatibility'));
assert.ok(critical.reviewConsumers.includes('seo'));
assert.ok(!critical.directConsumers.includes('compatibility'));

const care: CareArticleAdminInput = {
  catalogKey: 'care_demo', title: '换水后观察', category: '水质', urgency: '日常', summary: '观察状态',
  symptoms: ['应激'], steps: [{ instruction: '先观察', actionKind: 'immediate' }], avoidActions: ['不要猛加药'],
  observeItems: ['呼吸'], diagnoseWhen: ['持续异常'], nextStep: '必要时进一步诊断', keywords: ['换水'],
};
const careChange = buildContentImpact('care', care, {
  ...care,
  urgency: '高优先级',
  steps: [{ instruction: '立即检测水质', actionKind: 'immediate' }],
});
assert.equal(careChange.highestKind, 'care_workflow');
assert.ok(careChange.directConsumers.includes('care'));
assert.ok(careChange.directConsumers.includes('aquarium'));
assert.ok(careChange.directConsumers.includes('identify'));
assert.equal(careChange.reviewConsumers.length, 0);

const unchanged = buildContentImpact('species', species, { ...species });
assert.equal(unchanged.changes.length, 0);
assert.equal(unchanged.highestKind, null);

console.log('admin content impact: display/product-critical/care classifications and authority boundaries passed');
