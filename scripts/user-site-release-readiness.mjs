import { execFileSync, spawnSync } from 'node:child_process';
import { evaluateUserSiteReleaseReadiness } from './user-site-release-readiness-lib.mjs';

const run = (file, args) => {
  const result = spawnSync(file, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return {
    ok: result.status === 0,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim(),
  };
};

const project = JSON.parse(execFileSync('node', ['scripts/project-status.mjs'], { encoding: 'utf8' }));
const backend = run('npm', ['run', '-s', 'test:backend-release-gate']);
const golden = run('npm', ['run', '-s', 'test:golden-path-contract']);
const vision = run('npm', ['run', '-s', 'test:vision-provider-fallback']);
const adminStaging = Boolean(process.env.STAGING_SUPABASE_URL && process.env.STAGING_SUPABASE_SECRET_KEY);

const result = evaluateUserSiteReleaseReadiness({
  project,
  checks: {
    backendReleaseGate: backend.ok,
    goldenPathContract: golden.ok,
    visionFallbackSafety: vision.ok,
    adminContentStaging: adminStaging,
  },
});

console.log(JSON.stringify({
  evaluatedSha: project.sha,
  branch: project.localBranch,
  ...result,
  checks: {
    backendReleaseGate: backend.ok ? 'PASS' : 'FAIL',
    goldenPathContract: golden.ok ? 'PASS' : 'FAIL',
    visionFallbackSafety: vision.ok ? 'PASS' : 'FAIL',
    adminContentStaging: adminStaging ? 'READY' : 'SEPARATE_NOT_READY',
  },
}, null, 2));

if (result.phase === 'BLOCKED') process.exitCode = 1;
