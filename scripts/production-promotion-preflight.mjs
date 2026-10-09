import { execFileSync } from 'node:child_process';
import { evaluateProductionPromotionPreflight } from './production-promotion-preflight-lib.mjs';

const project = JSON.parse(execFileSync('node', ['scripts/project-status.mjs'], { encoding: 'utf8' }));
let userSite = { phase: 'UNKNOWN' };
try {
  userSite = JSON.parse(execFileSync('node', ['scripts/user-site-release-readiness.mjs'], { encoding: 'utf8' }));
} catch {}

const result = evaluateProductionPromotionPreflight({
  userSitePhase: userSite.phase,
  supabaseProjectStatus: process.env.AQUAGUIDE_SUPABASE_STATUS || 'UNKNOWN',
  supabaseParityVerified: process.env.AQUAGUIDE_SUPABASE_PARITY === 'verified',
  productionFrozen: project.productionDeploymentFrozen,
  mainSynchronized: project.localBranch === project.canonicalBranch && project.remoteSynchronized === true,
  pendingMigrationCount: process.env.AQUAGUIDE_PENDING_MIGRATIONS ? Number(process.env.AQUAGUIDE_PENDING_MIGRATIONS) : null,
});
console.log(JSON.stringify({ evaluatedSha: project.sha, ...result }, null, 2));
if (result.phase !== 'READY_TO_PROMOTE') process.exitCode = 2;
