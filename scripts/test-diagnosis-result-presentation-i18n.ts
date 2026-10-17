import assert from 'node:assert/strict';
import type { DiagnosisOutput } from '../src/modules/diagnosis/diagnosis.types';
import {
  getDiagnosisResultEnglishCoverage,
  projectDiagnosisOutputForPresentation,
} from '../src/modules/diagnosis/diagnosis.presentation';
import { buildDiagnosisVisualResult } from '../src/components/visual-results/visual-result.adapters';

const hasCjk = (value: string) => /[\u3400-\u9fff]/.test(value);
const collectStrings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).flatMap(collectStrings);
  return [];
};

const expectedRuleIds = [
  'water-breathing-high-risk',
  'frequent-breathing-warning',
  'occasional-breathing-watch',
  'multiple-death-high-risk',
  'after-water-change-stress',
  'new-fish-stress',
  'appetite-behavior-watch',
  'overfeeding-cloudy-water',
  'aggression-space-pressure',
  'water-clarity-check',
  'fry-care-flow',
  'pregnancy-care-flow',
  'normal-patrol',
  'generic-symptom-check',
  'static-no-aquarium',
  'static-no-livestock',
  'static-no-shrimp',
  'static-no-plants',
] as const;

const coverage = getDiagnosisResultEnglishCoverage();
assert.deepEqual(Object.keys(coverage.rules).sort(), [...expectedRuleIds].sort());

for (const ruleId of expectedRuleIds) {
  const riskLevel: DiagnosisOutput['riskLevel'] = ruleId.startsWith('static-')
    ? 'unknown'
    : ruleId.includes('high-risk') || ruleId === 'frequent-breathing-warning'
      ? 'high'
      : ruleId === 'generic-symptom-check'
        ? 'unknown'
        : 'medium';
  const canonical: DiagnosisOutput = {
    riskLevel,
    riskLabel: riskLevel === 'high' ? '高风险' : riskLevel === 'unknown' ? '信息不足' : '需要关注',
    summary: '中文规则结论占位',
    currentAction: '中文动作占位',
    actions: ['中文动作占位', '中文动作二'],
    avoidActions: ['中文避免项'],
    possibleCauses: ['中文原因'],
    observeItems: ['中文观察项'],
    missingInfo: ['中文缺失项'],
    evidence: ['来自当前鱼缸：Freshwater · 25°C · 60L'],
    keyMetrics: [
      { label: '问题类型', value: '巡检' },
      { label: '风险等级', value: riskLevel === 'high' ? '高风险' : riskLevel === 'unknown' ? '信息不足' : '需要关注' },
      { label: '最近换水', value: '3 天前' },
    ],
    matchedRules: [ruleId],
    matchedArticles: [],
  };
  const before = JSON.stringify(canonical);
  const english = projectDiagnosisOutputForPresentation(canonical, true);
  assert.equal(JSON.stringify(canonical), before, `presentation must not mutate canonical output: ${ruleId}`);
  for (const text of [
    english.riskLabel,
    english.summary,
    english.currentAction,
    ...english.actions,
    ...english.avoidActions,
    ...english.possibleCauses,
    ...english.observeItems,
    ...english.missingInfo,
    ...english.evidence,
    ...english.keyMetrics.flatMap(metric => [metric.label, metric.value]),
  ]) {
    assert.equal(hasCjk(text), false, `English diagnosis result contains CJK for ${ruleId}: ${text}`);
  }

  const visual = buildDiagnosisVisualResult({
    result: canonical,
    answers: {},
    aquariumName: 'Demo tank',
    livestock: [],
    primaryActionLabel: 'Save result',
    isEnglish: true,
  });
  for (const text of collectStrings(visual)) {
    assert.equal(hasCjk(text), false, `English visual result contains CJK for ${ruleId}: ${text}`);
  }
}

const canonicalFixture: DiagnosisOutput = {
  riskLevel: 'low',
  riskLabel: '低风险',
  summary: '当前未发现明显异常，可以正常观察。',
  currentAction: '正常观察',
  actions: ['正常观察', '记录喂食或换水', '发现异常再进入对应诊断'],
  avoidActions: ['不要无症状盲目下药', '不要频繁大换水'],
  possibleCauses: ['暂无明显异常'],
  observeItems: ['呼吸频率', '抢食状态', '水体异味'],
  missingInfo: [],
  evidence: ['来自当前鱼缸：Freshwater · 25°C · 60L', 'breathing：正常'],
  keyMetrics: [{ label: '问题类型', value: '巡检' }, { label: '风险等级', value: '低风险' }],
  matchedRules: ['normal-patrol'],
  matchedArticles: [],
};
const projectedFixture = projectDiagnosisOutputForPresentation(canonicalFixture, true);
assert.equal(projectedFixture.summary, 'No obvious abnormality was found; continue normal observation.');
assert.equal(projectedFixture.currentAction, 'Continue normal observation');
assert.equal(projectedFixture.evidence[1], 'Breathing: Normal');

console.log(`diagnosis result presentation i18n verified: ${expectedRuleIds.length} deterministic/static result keys project to English without mutating canonical output`);
