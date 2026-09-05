import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const state = JSON.parse(readFileSync('.ai/PROJECT_STATE.json', 'utf8'));
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
const sha = git(['rev-parse', 'HEAD']);
const dirty = git(['status', '--porcelain']);
const canonicalBranch = state.canonicalBranch ?? 'main';
const releaseCandidateBranch = state.releaseCandidate?.branch ?? null;
const isShortBranch = branch.startsWith('codex/')
  && branch !== releaseCandidateBranch
  && branch !== state.productionBranch;
const allowedBranches = new Set([canonicalBranch, releaseCandidateBranch, state.productionBranch].filter(Boolean));
const remoteTrackedBranch = isShortBranch ? branch : allowedBranches.has(branch) ? branch : canonicalBranch;
const remoteBranch = `origin/${remoteTrackedBranch}`;
let remoteSha = null;
if (existsSync('.git/refs/remotes/origin/' + remoteTrackedBranch)) {
  remoteSha = git(['rev-parse', remoteBranch]);
} else {
  // `--verify --quiet` avoids printing a fatal error while the candidate
  // branch is still local-only during the upload stage.
  try {
    remoteSha = git(['rev-parse', '--verify', '--quiet', remoteBranch]);
  } catch {
    remoteSha = null;
  }
}

const resolveSha = (ref) => {
  try {
    return git(['rev-parse', '--verify', '--quiet', ref]);
  } catch {
    return null;
  }
};

const isAncestor = (ancestor, descendant) => {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', ancestor, descendant]);
    return true;
  } catch {
    return false;
  }
};

const productionBranch = state.productionBranch ?? state.releaseBranch;
const productionAnchorSha = state.productionAnchor?.sha ?? null;
const productionPointerSha = productionBranch
  ? resolveSha(productionBranch) ?? resolveSha(`origin/${productionBranch}`)
  : null;
const productionPointerSynchronized = Boolean(
  productionPointerSha && productionAnchorSha && productionPointerSha === productionAnchorSha,
);
const productionProviders = state.productionProviders ?? {};
const activeProductionProviders = Object.values(productionProviders)
  .filter((provider) => provider?.status !== 'INACTIVE_LEGACY');
const productionDeploymentFrozen = activeProductionProviders.length > 0
  ? activeProductionProviders.every((provider) => provider?.status === 'ACTIVE_FROZEN')
  : state.productionDeploymentFrozen === true;

const canonicalSha = resolveSha(`origin/${canonicalBranch}`) ?? resolveSha(canonicalBranch);
if (!allowedBranches.has(branch) && !isShortBranch && process.env.CI !== 'true') {
  throw new Error(`Run project:status from ${canonicalBranch}, ${releaseCandidateBranch ?? 'the release candidate'}, or a codex/* short branch; current branch is ${branch}.`);
}
if (isShortBranch && canonicalSha && !isAncestor(canonicalSha, sha)) {
  throw new Error(`Short branch ${branch} does not contain ${canonicalBranch}@${canonicalSha}.`);
}
if (remoteSha && remoteSha !== sha && !isShortBranch && process.env.CI !== 'true') {
  throw new Error(`Candidate branch is not synchronized with origin (${sha} != ${remoteSha}).`);
}

console.log(JSON.stringify({
  canonicalBranch: state.canonicalBranch,
  sourceConvergenceBranch: state.sourceConvergenceBranch ?? state.releaseCandidate?.branch,
  productionBranch,
  productionAnchor: state.productionAnchor ?? null,
  productionPointerSha,
  productionPointerSynchronized,
  productionDeploymentFrozen,
  productionProviders,
  releaseBranch: state.releaseBranch,
  localBranch: branch,
  branchRole: branch === canonicalBranch
    ? 'canonical'
    : branch === state.productionBranch
      ? 'production_pointer'
      : branch === releaseCandidateBranch
        ? 'historical_candidate'
        : isShortBranch ? 'short_task_branch' : 'unrecognized',
  basedOnCanonicalSha: canonicalSha,
  containsCanonical: canonicalSha ? isAncestor(canonicalSha, sha) : null,
  sha,
  remoteSha,
  remoteSynchronized: remoteSha ? remoteSha === sha : false,
  activePullRequest: state.activePullRequest,
  historicalPullRequest: state.historicalPullRequest,
  localPreview: state.localPreview,
  dirty: Boolean(dirty),
  releaseReady: false,
}, null, 2));
