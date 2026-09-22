import { spawnSync } from 'node:child_process';

const gates = [
  ['Species Knowledge', 'npm', ['run', 'test:species-knowledge']],
  ['Fire Red Shrimp Knowledge', 'npm', ['run', 'test:fire-red-shrimp-knowledge-authority']],
  ['Wild Neocaridina Knowledge', 'npm', ['run', 'test:wild-neocaridina-knowledge-authority']],
  ['Pearl Red Snakehead Knowledge', 'npm', ['run', 'test:pearl-red-snakehead-knowledge-authority']],
  ['Neon Tetra Environment', 'npm', ['run', 'test:neon-tetra-environment-authority']],
  ['Launch Environment Batch', 'npm', ['run', 'test:launch-environment-batch-authority']],
  ['Multi Water Type Authority', 'npm', ['run', 'test:multi-water-type-authority']],
  ['Species Fit Multi Water', 'npm', ['run', 'test:species-fit-multi-water']],
  ['Rhodeus Compatibility Authority', 'npm', ['run', 'test:rhodeus-compatibility-authority']],
  ['Secondary Environment Batch', 'npm', ['run', 'test:secondary-environment-batch-authority']],
  ['Species Knowledge Completion Matrix', 'node', ['--import', 'tsx', 'scripts/test-species-knowledge-completion-matrix.ts']],
  ['Compatibility Engine', 'npm', ['run', 'test:compatibility']],
  ['Compatibility Symmetry', 'npm', ['run', 'test:compatibility-symmetry']],
  ['Compatibility Regression', 'npm', ['run', 'test:compatibility-regression-gate']],
  ['Domain Compatibility', 'npm', ['run', 'test:domain-compatibility']],
  ['Compatibility Service Authority', 'npm', ['run', 'test:compatibility-service']],
  ['Compatibility User Conclusion', 'npm', ['run', 'test:compatibility-user-conclusion']],
  ['Compatibility Knowledge Coverage', 'npm', ['run', 'test:compatibility-knowledge-coverage']],
  ['Gold Ram Compatibility Authority', 'npm', ['run', 'test:gold-ram-compatibility-authority']],
  ['Platinum Snakehead Catalog Bridge', 'npm', ['run', 'test:platinum-snakehead-catalog-bridge']],
  ['Platinum Snakehead Small Fish Pairs', 'npm', ['run', 'test:platinum-snakehead-small-fish-pairs']],
  ['Platinum Snakehead Remaining Pairs', 'npm', ['run', 'test:platinum-snakehead-remaining-pairs']],
  ['Identity Bound Catalog Bridges', 'npm', ['run', 'test:identity-bound-catalog-bridges']],
  ['Catalog Identity Boundaries', 'npm', ['run', 'test:catalog-identity-boundaries']],
  ['Knowledge Evidence Ceilings', 'npm', ['run', 'test:knowledge-evidence-ceilings']],
  ['Compatibility Pair Evidence Ceilings', 'npm', ['run', 'test:compatibility-pair-evidence-ceilings']],
  ['Tank State', 'npm', ['run', 'test:p0-tank-state']],
  ['Tank Evidence', 'npm', ['run', 'test:p0-tank-evidence']],
  ['Water Change', 'npm', ['run', 'test:p0-water-change']],
  ['Care Guidance', 'npm', ['run', 'test:care-guidance']],
  ['Core Flow V1', 'node', ['--import', 'tsx', 'scripts/test-core-flow-state-eval-v1.ts']],
  ['Core Flow V2', 'node', ['--import', 'tsx', 'scripts/test-core-flow-state-eval-v2.ts']],
  ['Species Diagnosis', 'npm', ['run', 'test:species-diagnosis']],
  ['API Origin', 'npm', ['run', 'test:api-origin-contract']],
  ['API CORS', 'node', ['--import', 'tsx', 'scripts/test-api-cors-contract.ts']],
  ['Vision Provider', 'node', ['--import', 'tsx', 'scripts/test-vision-provider-fallback.ts']],
  ['API Boundary', 'npm', ['run', 'test:api-boundary']],
  ['Business API', 'npm', ['run', 'test:business-api-contract']],
  ['Repository Boundary', 'npm', ['run', 'test:repository-boundary']],
  ['Catalog Snapshot', 'npm', ['run', 'test:catalog-snapshot']],
  ['Catalog Release', 'npm', ['run', 'test:catalog-release-contract']],
  ['API Typecheck', 'npm', ['run', 'check:api']],
  ['Project Typecheck', 'npm', ['run', 'lint']],
  ['Vercel Business Bundle', 'npm', ['run', 'build:business-api']],
  ['Git Diff Check', 'git', ['diff', '--check']],
];

for (const gate of gates) {
  const label = gate[0];
  const command = gate[1];
  const args = gate[2];
  process.stdout.write('\n=== ' + label + ' ===\n');
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (result.error) {
    console.error('[backend-release-gate] ' + label + ': failed to start', result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error('[backend-release-gate] ' + label + ': FAIL (' + result.status + ')');
    process.exit(result.status || 1);
  }
}

console.log('\nBACKEND_RELEASE_GATE=PASS');
