import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const state = JSON.parse(readFileSync('.ai/PROJECT_STATE.json', 'utf8'));
const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
const sha = git(['rev-parse', 'HEAD']);
const remoteSha = process.env.CI === 'true'
  ? null
  : git(['rev-parse', `origin/${state.canonicalBranch}`]);
const dirty = git(['status', '--porcelain']);

if (state.canonicalBranch !== 'codex/unified-rc-visual-v1') {
  throw new Error(`Unexpected canonical branch: ${state.canonicalBranch}`);
}
if (!state.canonicalBase?.sha || !state.businessReference?.sha || !state.localPreview || !state.activePullRequest) {
  throw new Error('PROJECT_STATE.json is missing required convergence metadata.');
}
if (process.env.CI !== 'true' && branch !== state.canonicalBranch) {
  throw new Error(`Run project:status from ${state.canonicalBranch}; current branch is ${branch}.`);
}
if (branch === state.canonicalBranch && remoteSha && sha !== remoteSha) {
  throw new Error(`Local canonical branch is not synchronized with origin (${sha} != ${remoteSha}).`);
}

console.log(JSON.stringify({
  canonicalBranch: state.canonicalBranch,
  localBranch: branch,
  sha,
  visualBaseline: state.canonicalBase.sha,
  businessReference: state.businessReference.sha,
  activePullRequest: state.activePullRequest,
  localPreview: state.localPreview,
  dirty: Boolean(dirty),
}, null, 2));
