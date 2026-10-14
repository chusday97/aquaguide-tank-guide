import { execFileSync, spawnSync } from 'node:child_process';
import { evaluateProductionPromotionPreflight } from './production-promotion-preflight-lib.mjs';

const project = JSON.parse(execFileSync('node', ['scripts/project-status.mjs'], { encoding: 'utf8' }));
const readJsonCommand = (file, args) => {
  const result = spawnSync(file, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const output = result.stdout?.trim();
  if (!output) return null;
  try { return JSON.parse(output); } catch { return null; }
};

const userSite = readJsonCommand(process.execPath, ['scripts/user-site-release-readiness.mjs']) || { phase: 'UNKNOWN' };

let coreUserStateParity = { phase: 'UNKNOWN', verified: false, blockers: ['parity_check_unavailable'] };
try {
  const parity = spawnSync(
    process.execPath,
    ['--import', 'tsx', 'scripts/core-user-state-production-parity.mjs'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  if (parity.stdout?.trim()) coreUserStateParity = JSON.parse(parity.stdout);
} catch {}

let supabaseProjectStatus = process.env.AQUAGUIDE_SUPABASE_STATUS || 'UNKNOWN';
if (!process.env.AQUAGUIDE_SUPABASE_STATUS) {
  const projects = readJsonCommand('supabase', ['projects', 'list', '--output', 'json']);
  if (Array.isArray(projects)) {
    const linked = projects.find(item => item?.linked === true && item?.ref === coreUserStateParity.projectRef)
      || projects.find(item => item?.linked === true);
    if (linked?.status) supabaseProjectStatus = linked.status;
  }
}

const result = evaluateProductionPromotionPreflight({
  userSitePhase: userSite.phase,
  supabaseProjectStatus,
  coreUserStateParityVerified: coreUserStateParity.verified === true,
  productionFrozen: project.productionDeploymentFrozen,
  mainSynchronized: project.localBranch === project.canonicalBranch && project.remoteSynchronized === true,
  deferredAdminMigrationCount: process.env.AQUAGUIDE_DEFERRED_ADMIN_MIGRATIONS
    ? Number(process.env.AQUAGUIDE_DEFERRED_ADMIN_MIGRATIONS)
    : null,
});
console.log(JSON.stringify({
  evaluatedSha: project.sha,
  userSite,
  coreUserStateParity,
  supabaseProjectStatus,
  ...result,
}, null, 2));
if (result.phase !== 'READY_TO_PROMOTE') process.exitCode = 2;
