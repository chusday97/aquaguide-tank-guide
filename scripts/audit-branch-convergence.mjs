import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const state = JSON.parse(readFileSync('.ai/PROJECT_STATE.json', 'utf8'));
const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const hasRef = (ref) => {
  try {
    git(['show-ref', '--verify', '--quiet', `refs/remotes/${ref}`]);
    return true;
  } catch {
    return false;
  }
};
const count = (left, right) => {
  const [leftOnly, rightOnly] = git(['rev-list', '--left-right', '--count', `${left}...${right}`])
    .split(/\s+/)
    .map(Number);
  return { leftOnly, rightOnly };
};

const canonical = `origin/${state.canonicalBranch}`;
const localBranch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
const effectiveBranch = process.env.GITHUB_REF_NAME || localBranch;
const localSha = git(['rev-parse', 'HEAD']);
const requiredRefs = [canonical, 'origin/main', 'origin/integration/aquaguide-rc1'];
const missingRefs = requiredRefs.filter((ref) => !hasRef(ref));
const remoteSha = hasRef(canonical) ? git(['rev-parse', canonical]) : null;
const parity = effectiveBranch === state.canonicalBranch && remoteSha === localSha;
const remoteRefs = git([
  'for-each-ref',
  '--format=%(refname:short)',
  'refs/remotes/origin',
])
  .split('\n')
  .map((ref) => ref.trim())
  .filter(Boolean)
  .filter((ref) => !['origin/HEAD', canonical].includes(ref));

const comparisons = {};
for (const ref of ['origin/main', 'origin/integration/aquaguide-rc1']) {
  comparisons[ref] = hasRef(ref) ? count(canonical, ref) : null;
}

const historicalBranches = remoteRefs
  .filter((ref) => !['origin/main', 'origin/integration/aquaguide-rc1'].includes(ref))
  .map((ref) => {
    const divergence = count(canonical, ref);
    const sha = git(['rev-parse', ref]);
    const subject = git(['show', '-s', '--format=%s', ref]);
    return { ref, sha, subject, ...divergence };
  })
  .filter(({ leftOnly, rightOnly }) => leftOnly > 0 || rightOnly > 0)
  .sort((a, b) => b.rightOnly - a.rightOnly || a.ref.localeCompare(b.ref));

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  canonicalBranch: state.canonicalBranch,
  localBranch,
  effectiveBranch,
  localSha,
  remoteSha,
  parity,
  status: missingRefs.length > 0 ? 'MISSING_REMOTE_REF' : parity ? 'SYNCHRONIZED' : 'NOT_SYNCHRONIZED',
  missingRefs,
  comparisons,
  historicalBranches,
}, null, 2));

if (process.argv.includes('--check') && (missingRefs.length > 0 || !parity)) {
  if (missingRefs.length > 0) console.error(`MISSING_REMOTE_REF: ${missingRefs.join(', ')}`);
  if (!parity) console.error(`NOT_SYNCHRONIZED: local ${localSha} != remote ${remoteSha ?? 'missing'} or branch is ${effectiveBranch}`);
  process.exitCode = 1;
}
