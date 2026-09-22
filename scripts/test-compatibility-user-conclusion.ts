import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { getCompatibilityPresentation } from '../src/services/compatibility/compatibility-presentation.service';
import type { Aquarium } from '../src/types';
import type { CompatibilityDecision } from '../src/modules/knowledge/knowledge.types';

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, 'missing catalog fish ' + id);
  return fish;
};

const tank = (length: number, width: number, height: number, temperature: number): Aquarium => ({
  id: 'user-conclusion-tank',
  name: '用户结论测试缸',
  fishes: [],
  dimensions: { length: String(length), width: String(width), height: String(height) },
  waterType: 'Freshwater',
  targetTemperature: String(temperature),
  equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
});

const underGroupedNeon = evaluateTankCompatibility({
  tank: tank(70, 30, 40, 24),
  candidateSpecies: byId('sp_0431'),
  candidateQuantity: 7,
});
assert.equal(underGroupedNeon.status, 'caution');
assert.ok(underGroupedNeon.warningRules.some(rule => rule.code === 'group_requirement_gap'));
assert.ok(underGroupedNeon.suggestions.some(item => item.includes('最低群体数量')));
assert.ok(underGroupedNeon.suggestions.every(item => !item.includes('移除阻断风险')));

const goldRamWithPanda = evaluateTankCompatibility({
  tank: tank(100, 40, 30, 25),
  existingSpecies: [{ species: byId('sp_0016'), record: { quantity: 2 } }],
  candidateSpecies: byId('sp_0443'),
  candidateQuantity: 6,
});
assert.equal(goldRamWithPanda.status, 'caution');
assert.equal(goldRamWithPanda.missingData.length, 0);
assert.ok(goldRamWithPanda.warningRules.some(rule => rule.code === 'territorial_pressure_context'));
assert.ok(goldRamWithPanda.suggestions.some(item => item.includes('主要风险项')));
assert.ok(goldRamWithPanda.suggestions.every(item => !item.includes('更换候选生物')));
assert.ok(goldRamWithPanda.suggestions.every(item => !item.includes('资料尚未审核')));

const channaWithNeon = evaluateTankCompatibility({
  tank: tank(120, 50, 40, 24),
  existingSpecies: [{ species: byId('sp_0431'), record: { quantity: 10 } }],
  candidateSpecies: byId('sp_0049'),
  candidateQuantity: 1,
});
assert.equal(channaWithNeon.status, 'not_recommended');
assert.ok(channaWithNeon.blockingRules.some(rule => rule.code === 'predation_risk'));
assert.ok(channaWithNeon.suggestions.some(item => item.includes('阻断')));

const duplicateWarningDecision = {
  status: 'caution',
  riskLevel: 'medium',
  summary: '需要调整',
  pairResults: [],
  blockedReasons: [],
  adjustableReasons: [],
  missingInformation: [],
  passedRules: [],
  warningRules: [
    { code: 'territorial_pressure_context', title: '领地压力', evidence: '证据 A' },
    { code: 'territorial_pressure_context', title: '领地压力', evidence: '证据 B' },
  ],
  blockingRules: [],
  missingData: [],
  suggestions: [],
  aggregateResult: {},
  metadata: {},
} as unknown as CompatibilityDecision;

const presentation = getCompatibilityPresentation(duplicateWarningDecision);
assert.equal(presentation.headline, '有条件可以');
assert.equal(presentation.cautions.length, 1);
assert.equal(presentation.confirmedFindings.length, 1);
assert.equal(presentation.primaryReason, '证据 A');
assert.equal(presentation.secondaryReason, '证据 B');
assert.ok(presentation.primaryActionText.length > 0);
assert.equal(presentation.detailsLabel, '查看依据');

const underGroupedPresentation = getCompatibilityPresentation(underGroupedNeon as unknown as CompatibilityDecision);
assert.equal(underGroupedPresentation.headline, '有条件可以');
assert.match(underGroupedPresentation.primaryReason, /群体|最低/);
assert.match(underGroupedPresentation.primaryActionText, /至少|最低群体|规划/);

const predationPresentation = getCompatibilityPresentation(channaWithNeon as unknown as CompatibilityDecision);
assert.equal(predationPresentation.headline, '不建议');
assert.match(predationPresentation.primaryReason, /捕食|吞食/);
assert.match(predationPresentation.primaryActionText, /不要|先不要/);

console.log('compatibility user conclusion contract passed: status-specific actions, reviewed-unknown safety, and user-facing dedupe');
