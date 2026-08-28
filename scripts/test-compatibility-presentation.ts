import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCompatibilityPresentation } from '../src/services/compatibility/compatibility-presentation.service';
import { buildCompatibilityVisualResult } from '../src/components/visual-results/visual-result.adapters';
import type { CompatibilityDecision } from '../src/modules/knowledge/knowledge.types';
import type { TankCompatibilityRule } from '../src/services/compatibility/compatibility.service';
import type { Fish } from '../src/types';

const rule = (code: string, title: string, evidence = title): TankCompatibilityRule => ({
  code, title, evidence, severity: 'info' as const, citations: [], source: 'test',
} as unknown as TankCompatibilityRule);
const baseDecision = (overrides: Partial<CompatibilityDecision> = {}): CompatibilityDecision => ({
  status: 'insufficient_data',
  riskLevel: 'unknown',
  summary: '内部状态仅用于安全降级',
  pairResults: [],
  blockedReasons: [],
  adjustableReasons: [],
  missingInformation: [],
  passedRules: [],
  warningRules: [],
  blockingRules: [],
  missingData: [rule('species_evidence_unreviewed', '行为资料待审核')],
  suggestions: [],
  aggregateResult: {} as CompatibilityDecision['aggregateResult'],
  metadata: {} as CompatibilityDecision['metadata'],
  ...overrides,
});

const partial = getCompatibilityPresentation(baseDecision({
  passedRules: [rule('water_type_match', '水体类型相符'), rule('temperature_range_overlap', '温度区间可重合')],
}));
assert.equal(partial.mode, 'confirmed_facts');
assert.equal(partial.headline, '当前可确认');
assert.equal(partial.primaryAction, 'save_to_wishlist');
assert.match(partial.coverageLabel || '', /水体/);
assert.doesNotMatch(JSON.stringify(partial), /资料不足|信息不足/);

const unavailable = getCompatibilityPresentation(baseDecision());
assert.equal(unavailable.mode, 'unavailable');
assert.equal(unavailable.headline, '暂未开放这组混养建议');
assert.equal(unavailable.primaryAction, 'save_to_wishlist');

for (const [status, headline] of [
  ['compatible', '当前条件适合'],
  ['caution', '调整后可尝试'],
  ['not_recommended', '不建议一起饲养'],
] as const) {
  const presentation = getCompatibilityPresentation(baseDecision({ status }));
  assert.equal(presentation.mode, 'verdict');
  assert.equal(presentation.headline, headline);
}

const species = (id: string, name: string): Fish => ({
  id, name, scientificName: name, category: '小型观赏鱼', waterType: 'freshwater', image: '/test.png',
  difficulty: 'Easy', waterTemperature: '22-26°C', phLevel: '6.5-7.5', waterChangeCycle: 7,
  description: name, diet: '杂食', tankSize: '40L', temperament: 'Peaceful', size: 'Small', housingMode: '适合混养',
});
const model = buildCompatibilityVisualResult({
  decision: baseDecision({ passedRules: [rule('water_type_match', '水体类型相符')] }),
  species: [species('a', '红绿灯'), species('b', '宝莲灯')],
  primaryActionLabel: '加入种草清单',
});
assert.equal(model.presentationMode, 'confirmed_facts');
assert.equal(model.statusLabel, '当前可确认');
assert.doesNotMatch(JSON.stringify(model), /资料不足|信息不足/);

for (const file of [
  'src/components/CompatibilityRiskCalculator.tsx',
  'src/components/SpeciesDetailDialog.tsx',
  'src/components/visual-results/VisualResultCard.tsx',
  'src/components/visual-results/visual-result.adapters.ts',
  'src/pages/Encyclopedia.tsx',
]) {
  const source = readFileSync(resolve(process.cwd(), file), 'utf8');
  assert.doesNotMatch(source, /资料不足|信息不足|fitInsufficient/, `${file} must not expose raw compatibility unknown copy`);
}

const aquariumSource = readFileSync(resolve(process.cwd(), 'src/pages/Aquarium.tsx'), 'utf8');
assert.doesNotMatch(aquariumSource, /请先补充鱼缸信息，再评估是否可以加入/);
assert.match(aquariumSource, /evaluation\.result\.status === 'insufficient_data' \? '当前可确认部分条件'/);
assert.match(aquariumSource, /syncWishlistFishIds\(next\)/);
assert.match(aquariumSource, /getCompatibilityPresentationForStatus/);

console.log('compatibility presentation: verdict, partial facts, unavailable fallback passed');
