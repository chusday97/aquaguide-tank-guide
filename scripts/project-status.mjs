import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const state = JSON.parse(readFileSync('.ai/PROJECT_STATE.json', 'utf8'));
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
const sha = git(['rev-parse', 'HEAD']);
const dirty = git(['status', '--porcelain']);
const allowedBranches = new Set([state.canonicalBranch, state.releaseCandidate?.branch].filter(Boolean));
const remoteTrackedBranch = allowedBranches.has(branch) ? branch : state.canonicalBranch;
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

if (!allowedBranches.has(branch) && process.env.CI !== 'true') {
  throw new Error(`Run project:status from ${state.canonicalBranch} or ${state.releaseCandidate?.branch}; current branch is ${branch}.`);
}
if (remoteSha && remoteSha !== sha && process.env.CI !== 'true') {
  throw new Error(`Candidate branch is not synchronized with origin (${sha} != ${remoteSha}).`);
}

console.log(JSON.stringify({
  canonicalBranch: state.canonicalBranch,
  releaseBranch: state.releaseBranch,
  localBranch: branch,
  sha,
  remoteSha,
  remoteSynchronized: remoteSha ? remoteSha === sha : false,
  activePullRequest: state.activePullRequest,
  historicalPullRequest: state.historicalPullRequest,
  localPreview: state.localPreview,
  dirty: Boolean(dirty),
  releaseReady: false,
}, null, 2));
