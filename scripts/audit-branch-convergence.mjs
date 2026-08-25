import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const state = JSON.parse(readFileSync('.ai/PROJECT_STATE.json', 'utf8'));
const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const count = (left, right) => {
  const [leftOnly, rightOnly] = git(['rev-list', '--left-right', '--count', `${left}...${right}`])
    .split(/\s+/)
    .map(Number);
  return { leftOnly, rightOnly };
};

const canonical = `origin/${state.canonicalBranch}`;
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
  comparisons[ref] = count(canonical, ref);
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
  canonicalSha: git(['rev-parse', canonical]),
  comparisons,
  historicalBranches,
}, null, 2));
