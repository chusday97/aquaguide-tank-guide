export const evaluateUserSiteReleaseReadiness = ({ project, checks }) => {
  const coreChecks = ['backendReleaseGate', 'goldenPathContract', 'visionFallbackSafety'];
  const failedCore = coreChecks.filter((key) => checks[key] !== true);
  const repoReady = project.dirty === false
    && project.containsCanonical === true
    && project.productionDeploymentFrozen === true
    && failedCore.length === 0;

  let phase = 'BLOCKED';
  if (repoReady && project.localBranch === project.canonicalBranch && project.remoteSynchronized === true) {
    phase = 'READY_FOR_PROMOTION_DECISION';
  } else if (repoReady) {
    phase = 'READY_FOR_MERGE';
  }

  return {
    phase,
    coreUserSiteReady: repoReady,
    blockers: [
      ...(project.dirty ? ['worktree_dirty'] : []),
      ...(project.containsCanonical !== true ? ['does_not_contain_canonical'] : []),
      ...(project.productionDeploymentFrozen !== true ? ['production_not_frozen'] : []),
      ...failedCore.map((key) => `check_failed:${key}`),
      ...(project.localBranch === project.canonicalBranch && project.remoteSynchronized !== true ? ['canonical_not_remote_synchronized'] : []),
    ],
    featureStatus: {
      vision: checks.visionFallbackSafety === true ? 'safe_degraded' : 'blocked',
      adminContentStaging: checks.adminContentStaging === true ? 'ready' : 'separate_not_ready',
      careSeoIndexing: 'separate_release_decision',
    },
    promotionAuthorized: false,
    notes: [
      'READY_FOR_PROMOTION_DECISION means the user-facing site is ready for an explicit release decision; it does not mean Production has been deployed.',
      'Vision safe_degraded means automatic recognition may fail closed to manual search when the strong provider is unavailable.',
      'Admin Content Staging and Care SEO indexing are tracked separately and do not block the user-facing site core release decision.',
    ],
  };
};
