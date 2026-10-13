import { mkdirSync, writeFileSync } from 'node:fs';
import { runCompatibilityV4LiveCanary } from './compatibility-v4-live-canary';

const outputPath = process.env.COMPATIBILITY_V4_CANARY_OUTPUT
  || '.artifacts/readiness/compatibility-v4-live-canary.json';

const report = await runCompatibilityV4LiveCanary();
mkdirSync(outputPath.split('/').slice(0, -1).join('/') || '.', { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  outputPath,
  provider: report.provider,
  outcome: report.outcome,
  summary: report.summary,
}, null, 2));

if (report.summary.finalDecisionMutations > 0) process.exit(2);
if (report.provider.configured && report.outcome !== 'pass_guarded') process.exit(3);
