import { writeFileSync } from 'node:fs';
import { buildCompatibilityV4ShadowEval } from './compatibility-v4-shadow-eval-fixtures';

const report = await buildCompatibilityV4ShadowEval();
writeFileSync(
  'docs/compatibility_v4_shadow_eval.json',
  JSON.stringify(report, null, 2) + '\n',
);

const rows = report.cases.map(item => [
  item.caseId,
  item.species.map(species => species.name + '×' + species.quantity).join(' + '),
  item.deterministic.status + ' / ' + item.deterministic.decisionReadiness,
  item.deterministic.ruleCodes.join(', ') || 'none',
  item.ai.status + (item.ai.attemptedVerdict ? ' → ' + item.ai.attemptedVerdict : ''),
  item.finalDecision.status,
  item.finalDecision.unchanged ? 'PASS' : 'FAIL',
]);

const markdown = [
  '# Compatibility V4 Shadow Eval',
  '',
  'This artifact is generated from current catalog/runtime authority. It does not call a live model; the provider is deterministic and adversarial so authority guards are regression-testable.',
  '',
  'Tank fixture: 120 × 50 × 50 cm, Freshwater, 25°C.',
  '',
  '| Case | Species | Deterministic | Rule codes | Shadow AI | Final | Invariant |',
  '| --- | --- | --- | --- | --- | --- | --- |',
  ...rows.map(row => '| ' + row.map(cell => String(cell).replace(/\|/g, '\\|')).join(' | ') + ' |'),
  '',
  '## Summary',
  '',
  '- Total cases: ' + report.summary.totalCases,
  '- AI accepted: ' + report.summary.acceptedAi,
  '- AI rejected: ' + report.summary.rejectedAi,
  '- AI skipped: ' + report.summary.skippedAi,
  '- Final-decision mutations: ' + report.summary.finalDecisionMutations,
  '',
  '## Invariants',
  '',
  ...report.invariants.map(item => '- ' + item),
  '',
].join('\n');

writeFileSync('docs/compatibility_v4_shadow_eval.md', markdown);
console.log(JSON.stringify(report.summary));
