import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
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

const tigerGuppyDecision = evaluateCompatibilityDecision({
  tank: tank(100, 40, 30, 24),
  items: [
    { species: byId('sp_0439'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0436'), quantity: 5, origin: 'candidate' },
  ],
});
assert.equal(tigerGuppyDecision.status, 'not_recommended');
const tigerGuppyPair = tigerGuppyDecision.pairResults[0];
assert.ok(tigerGuppyPair?.primaryReason);
assert.equal(tigerGuppyPair.primaryReason.riskType, 'aggression');
assert.equal(tigerGuppyPair.primaryReason.sourceRule.code, 'pair_rule_fin_nipping_long_fin_conflict');
assert.match(tigerGuppyPair.primaryReason.evidence, /追鳍|长鳍/);
assert.doesNotMatch(tigerGuppyPair.primaryReason.evidence, /捕食风险实验支持/);

const multiSpeciesConflict = evaluateCompatibilityDecision({
  tank: tank(120, 50, 40, 24),
  items: [
    { species: byId('sp_0049'), quantity: 1 },
    { species: byId('sp_0431'), quantity: 10 },
    { species: byId('sp_0443'), quantity: 6 },
  ],
});
assert.equal(multiSpeciesConflict.pairResults.length, 3);
assert.equal(multiSpeciesConflict.status, 'not_recommended');
assert.equal(multiSpeciesConflict.metadata.domainStatus, multiSpeciesConflict.status);
assert.ok(multiSpeciesConflict.blockingRules.some(rule => rule.code === 'predation_risk'));
assert.ok(multiSpeciesConflict.blockedReasons.some(reason => reason.sourceRule.code === 'predation_risk'));
const multiSpeciesConflictPresentation = getCompatibilityPresentation(multiSpeciesConflict);
assert.equal(multiSpeciesConflictPresentation.headline, '不建议');
assert.match(multiSpeciesConflictPresentation.primaryReason, /捕食|吞食/);
assert.match(multiSpeciesConflictPresentation.primaryActionText, /不要|先不要/);

const cumulativeLoadItems = ['sp_0012', 'sp_0431', 'sp_0443'].map(id => ({
  species: byId(id),
  quantity: 12,
}));
const cumulativeLoadDecision = evaluateCompatibilityDecision({
  tank: tank(60, 30, 35, 24),
  items: cumulativeLoadItems,
});
assert.equal(cumulativeLoadDecision.pairResults.length, 3);
assert.equal(cumulativeLoadDecision.status, 'caution');
assert.equal(cumulativeLoadDecision.metadata.domainStatus, cumulativeLoadDecision.status);
assert.ok(cumulativeLoadDecision.warningRules.some(rule => rule.code === 'bioload_over_limit'));
assert.ok(cumulativeLoadDecision.adjustableReasons.some(reason => reason.riskType === 'bioload'));
const cumulativeLoadLimitRule = cumulativeLoadDecision.warningRules.find(rule => rule.code === 'bioload_over_limit');
assert.ok(cumulativeLoadLimitRule);
assert.equal(
  cumulativeLoadLimitRule.evidence.split('该数值只用于粗略筛查，不代表硬性安全上限。').length - 1,
  1,
);
const cumulativeLoadPresentation = getCompatibilityPresentation(cumulativeLoadDecision);
assert.equal(cumulativeLoadPresentation.headline, '有条件可以');
assert.match(cumulativeLoadPresentation.primaryReason, /负荷|负载/);
assert.match(cumulativeLoadPresentation.primaryActionText, /数量|过滤|加入/);

const reducedLoadDecision = evaluateCompatibilityDecision({
  tank: tank(60, 30, 35, 24),
  items: cumulativeLoadItems.map(item => ({ ...item, quantity: 8 })),
});
assert.equal(reducedLoadDecision.status, 'compatible');
assert.equal(reducedLoadDecision.metadata.domainStatus, reducedLoadDecision.status);
assert.ok(reducedLoadDecision.warningRules.every(rule => !rule.code.includes('bioload')));
const reducedLoadPresentation = getCompatibilityPresentation(reducedLoadDecision);
assert.equal(reducedLoadPresentation.headline, '可以养');
assert.match(reducedLoadPresentation.primaryActionText, /可以按当前计划加入/);

const mergedDuplicateSpecies = evaluateCompatibilityDecision({
  tank: tank(80, 35, 40, 24),
  items: [
    { species: byId('sp_0431'), quantity: 8 },
    { species: byId('sp_0443'), quantity: 6 },
  ],
});
const splitDuplicateSpecies = evaluateCompatibilityDecision({
  tank: tank(80, 35, 40, 24),
  items: [
    { species: byId('sp_0431'), quantity: 4 },
    { species: byId('sp_0431'), quantity: 4 },
    { species: byId('sp_0443'), quantity: 6 },
  ],
});
assert.equal(mergedDuplicateSpecies.status, 'compatible');
assert.equal(splitDuplicateSpecies.status, mergedDuplicateSpecies.status);
assert.deepEqual(
  splitDuplicateSpecies.pairResults.map(pair => pair.pairId),
  mergedDuplicateSpecies.pairResults.map(pair => pair.pairId),
);
assert.ok(splitDuplicateSpecies.warningRules.every(rule => (
  rule.code !== 'minimum_group_not_met' && rule.code !== 'group_requirement_gap'
)));
assert.equal(splitDuplicateSpecies.metadata.domainStatus, splitDuplicateSpecies.status);

console.log('compatibility user conclusion contract passed: direct actions, multi-species aggregation, duplicate-species normalization, adjustment improvement, and user-facing dedupe');
