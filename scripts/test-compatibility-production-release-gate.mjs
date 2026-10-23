import { spawnSync } from 'node:child_process';

const gates = [
  ['identity:auto-onboarding-blind', ['--import', 'tsx', 'scripts/test-compatibility-auto-onboarding-blind.ts']],
  ['identity:migration-audit', ['--import', 'tsx', 'scripts/test-compatibility-identity-migration-audit.ts']],
  ['identity:review-queue', ['--import', 'tsx', 'scripts/test-compatibility-identity-review-queue.ts']],
  ['compatibility:regression', ['--import', 'tsx', 'scripts/test-compatibility-regression-gate.ts']],
  ['compatibility:real-user-pressure', ['--import', 'tsx', 'scripts/test-compatibility-real-user-pressure.ts']],
  ['compatibility:release-badcases', ['--import', 'tsx', 'scripts/test-compatibility-release-badcases.ts']],
  ['observability:session-events', ['--import', 'tsx', 'scripts/test-session-events.ts']],
  ['observability:badcase-aggregation', ['--import', 'tsx', 'scripts/test-compatibility-observability.ts']],
  ['production:readiness-contract', ['scripts/test-compatibility-production-readiness.mjs']],
];

for (const [name, args] of gates) {
  process.stdout.write('\n[compatibility-release-gate] ' + name + '\n');
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    console.error('\n[compatibility-release-gate] BLOCKED at ' + name);
    process.exit(result.status || 1);
  }
}

console.log('\nCompatibility production release gate PASS: Identity is explicitly routed, real-user and release badcases pass, anomaly-only observability is enforced, and the production-readiness contract is intact.');
