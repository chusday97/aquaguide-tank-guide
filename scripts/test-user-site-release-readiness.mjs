import assert from 'node:assert/strict';
import { evaluateUserSiteReleaseReadiness } from './user-site-release-readiness-lib.mjs';

const baseProject = {
  canonicalBranch: 'main',
  localBranch: 'main',
  dirty: false,
  containsCanonical: true,
  remoteSynchronized: true,
  productionDeploymentFrozen: true,
};
const greenChecks = {
  backendReleaseGate: true,
  goldenPathContract: true,
  visionFallbackSafety: true,
  adminContentStaging: false,
};

let result = evaluateUserSiteReleaseReadiness({ project: baseProject, checks: greenChecks });
assert.equal(result.phase, 'READY_FOR_PROMOTION_DECISION');
assert.equal(result.coreUserSiteReady, true);
assert.equal(result.featureStatus.vision, 'safe_degraded');
assert.equal(result.featureStatus.adminContentStaging, 'separate_not_ready');
assert.equal(result.promotionAuthorized, false);
assert.deepEqual(result.blockers, []);

result = evaluateUserSiteReleaseReadiness({
  project: { ...baseProject, localBranch: 'codex/task', remoteSynchronized: true },
  checks: greenChecks,
});
assert.equal(result.phase, 'READY_FOR_MERGE');
assert.equal(result.coreUserSiteReady, true);

result = evaluateUserSiteReleaseReadiness({
  project: { ...baseProject, productionDeploymentFrozen: false },
  checks: greenChecks,
});
assert.equal(result.phase, 'BLOCKED');
assert.ok(result.blockers.includes('production_not_frozen'));

result = evaluateUserSiteReleaseReadiness({
  project: baseProject,
  checks: { ...greenChecks, visionFallbackSafety: false },
});
assert.equal(result.phase, 'BLOCKED');
assert.equal(result.featureStatus.vision, 'blocked');
assert.ok(result.blockers.includes('check_failed:visionFallbackSafety'));

console.log('user-site release readiness contract PASS');
