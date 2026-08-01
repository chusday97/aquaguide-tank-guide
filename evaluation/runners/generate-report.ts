import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { badcaseSchema } from '../schemas/evaluation-case.schema';
import { projectRoot, readEvaluationCases, readJsonLines, readResultFile, reportsDir } from './io';

const results = [
  ...readResultFile('deterministic'),
  ...readResultFile('mocked-provider'),
  ...readResultFile('live-provider'),
];
if (!results.length) throw new Error('No evaluation results found. Run eval:deterministic and eval:mocked first.');

const cases = readEvaluationCases([
  'evaluation/datasets/tank-copilot.v1.jsonl',
  'evaluation/datasets/daily-check.v1.jsonl',
  'evaluation/datasets/species-diagnosis.v1.jsonl',
]);
const caseById = new Map(cases.map(testCase => [testCase.id, testCase]));
const badcases = readJsonLines('evaluation/badcases/registry.jsonl', value => badcaseSchema.parse(value));
const rate = (subset: typeof results) => subset.length ? subset.filter(item => item.passed).length / subset.length : null;
const critical = results.filter(item => item.severity === 'critical');
const fallback = results.filter(item => item.source === 'fallback');
const localization = results.filter(item => item.category === 'localization');
const regressions = results.filter(item => caseById.get(item.caseId)?.metadata.origin === 'regression');
const categoryRates = Object.fromEntries([...new Set(results.map(item => item.category))].sort().map(category => [category, rate(results.filter(item => item.category === category))]));

const report = {
  generatedAt: new Date().toISOString(),
  totals: { cases: results.length, passed: results.filter(item => item.passed).length, failed: results.filter(item => !item.passed).length },
  metrics: {
    overallPassRate: rate(results),
    criticalSafetyPassRate: rate(critical),
    ruleComplianceRate: rate(results.filter(item => item.runner !== 'live_provider')),
    structuredOutputPassRate: rate(results),
    fallbackSuccessRate: rate(fallback),
    localizationConsistencyRate: rate(localization),
    categoryPassRates: categoryRates,
    newBadcaseCount: badcases.filter(item => item.status === 'open' || item.status === 'investigating').length,
    historicalRegressionFailureCount: regressions.filter(item => !item.passed).length,
  },
  sourceCounts: Object.fromEntries(['deterministic', 'mocked_provider', 'live_provider'].map(runner => [runner, results.filter(item => item.runner === runner).length])),
  failures: results.filter(item => !item.passed).map(item => ({ caseId: item.caseId, runner: item.runner, failures: item.failures, failureReason: item.failureReason })),
};

const percent = (value: number | null) => value === null ? 'N/A' : `${(value * 100).toFixed(1)}%`;
const markdown = `# AquaGuide Evaluation Report

Generated: ${report.generatedAt}

| Metric | Result |
| --- | ---: |
| Total pass rate | ${percent(report.metrics.overallPassRate)} (${report.totals.passed}/${report.totals.cases}) |
| Critical Safety Pass Rate | ${percent(report.metrics.criticalSafetyPassRate)} |
| Rule Compliance Rate | ${percent(report.metrics.ruleComplianceRate)} |
| Structured Output Pass Rate | ${percent(report.metrics.structuredOutputPassRate)} |
| Fallback Success Rate | ${percent(report.metrics.fallbackSuccessRate)} |
| Localization Consistency Rate | ${percent(report.metrics.localizationConsistencyRate)} |
| Open / investigating Badcases | ${report.metrics.newBadcaseCount} |
| Historical Regression failures | ${report.metrics.historicalRegressionFailureCount} |

## Category pass rates

${Object.entries(categoryRates).map(([category, value]) => `- ${category}: ${percent(value)}`).join('\n')}

## Evidence boundary

- Deterministic and mocked results validate rules, schemas, filters and fallbacks; they are not real-model quality claims.
- Live Provider results only exist when explicitly run with \`RUN_LIVE_EVAL=1\`.
- Vision accuracy remains unverified until an authorized real-image manifest exists.

## Failures

${report.failures.length ? report.failures.map(item => `- ${item.caseId} (${item.runner}): ${item.failures.join('; ')}`).join('\n') : '- None'}
`;

writeFileSync(resolve(reportsDir, 'latest.json'), JSON.stringify(report, null, 2));
writeFileSync(resolve(reportsDir, 'latest.md'), markdown);
console.log(`evaluation report: ${report.totals.passed}/${report.totals.cases} passed`);
console.log(resolve(projectRoot, 'evaluation/reports/latest.md'));
