import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  COMPATIBILITY_STATUS_LABELS,
  getCompatibilityStatusLabel,
  getCompatibilityStatusLabelLocalized,
  type CompatibilityStatus,
} from '../src/services/compatibility/compatibility-status-label.service';
import { getCompatibilityPresentationForStatus } from '../src/services/compatibility/compatibility-presentation.service';

const expected = {
  compatible: { zh: '可以混养', en: 'Compatible' },
  caution: { zh: '条件混养', en: 'Compatible with conditions' },
  not_recommended: { zh: '不建议混养', en: 'Not recommended' },
  insufficient_data: { zh: '需要关键信息', en: 'Key information needed' },
} as const satisfies Record<CompatibilityStatus, { zh: string; en: string }>;

for (const status of Object.keys(expected) as CompatibilityStatus[]) {
  assert.equal(COMPATIBILITY_STATUS_LABELS.zh[status], expected[status].zh);
  assert.equal(COMPATIBILITY_STATUS_LABELS.en[status], expected[status].en);
  assert.equal(getCompatibilityStatusLabel(status, 'zh-CN'), expected[status].zh);
  assert.equal(getCompatibilityStatusLabel(status, 'en'), expected[status].en);
  assert.equal(getCompatibilityStatusLabelLocalized(status, false), expected[status].zh);
  assert.equal(getCompatibilityStatusLabelLocalized(status, true), expected[status].en);
  assert.equal(
    getCompatibilityPresentationForStatus({ status, hasConfirmedFacts: false }).headline,
    expected[status].zh,
  );
}

const runtimeFiles = [
  '../src/services/compatibility/compatibility-readable-copy.service.ts',
  '../src/services/compatibility/compatibility-assessment.service.ts',
  '../src/services/compatibility/compatibility-assessment-presentation.service.ts',
  '../src/services/compatibility/compatibility-presentation.service.ts',
  '../src/services/compatibility/compatibility.service.ts',
  '../src/components/CompatibilityRiskCalculator.tsx',
  '../src/components/visual-results/visual-result.adapters.ts',
].map(path => ({
  path,
  source: readFileSync(new URL(path, import.meta.url), 'utf8'),
}));

const forbiddenVerdictAliases = [
  "'可以养'",
  "'有条件可以'",
  "'暂时无法判断'",
  "'Compatible with adjustments'",
  "'More information needed'",
  "'谨慎尝试'",
  "'当前可确认'",
  "'Confirmed Factors'",
];

for (const { path, source } of runtimeFiles) {
  for (const alias of forbiddenVerdictAliases) {
    assert.equal(source.includes(alias), false, `${path} must not define the old Compatibility verdict alias ${alias}`);
  }
}

const calculator = runtimeFiles.find(item => item.path.endsWith('CompatibilityRiskCalculator.tsx'))!.source;
assert.match(calculator, /getCompatibilityStatusLabelLocalized/);
assert.match(calculator, /getCompatibilityStatusLabelLocalized\(result\.level as TankCompatibilityStatus, isEn\)/);

const visualAdapter = runtimeFiles.find(item => item.path.endsWith('visual-result.adapters.ts'))!.source;
assert.match(visualAdapter, /statusLabel: getCompatibilityStatusLabelLocalized\(decision\.status, isEnglish\)/);
assert.match(visualAdapter, /title: getCompatibilityStatusLabelLocalized\(decision\.status, isEnglish\)/);

const apiProduct = readFileSync(new URL('../apps/api/src/compatibility-ai-product.ts', import.meta.url), 'utf8');
assert.match(apiProduct, /buildCompatibilityReadableConclusion/);
assert.doesNotMatch(apiProduct, /Compatible with adjustments|More information needed|有条件可以|暂时无法判断/);

const aquarium = readFileSync(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
assert.match(aquarium, /projectCompatibilityAssessmentForLocale|getCompatibilityPresentationForStatus/);

const sharedReport = readFileSync(new URL('../src/pages/SharedReport.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(
  sharedReport,
  /CompatibilityDecision|有条件可以|暂时无法判断|Compatible with adjustments|More information needed/,
  'SharedReport is a general aquarium-health report and must not maintain a separate Compatibility verdict mapping',
);

console.log('Compatibility status-label consistency PASS: all four statuses share one zh/en verdict contract across local presentation, calculator/visual surfaces and API-readable output; SharedReport has no competing Compatibility mapping.');
