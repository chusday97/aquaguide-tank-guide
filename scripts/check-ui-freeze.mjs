import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const configPath = resolve(root, '.ai/UI_FREEZE.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

const baseline = config.baselineCommit;
try {
  git(['cat-file', '-e', `${baseline}^{commit}`]);
  git(['merge-base', '--is-ancestor', baseline, 'HEAD']);
} catch {
  console.error(`UI freeze baseline ${baseline} is missing or is not an ancestor of HEAD.`);
  process.exit(1);
}

const tracked = git(['diff', '--name-only', baseline, '--']).split('\n').filter(Boolean);
const untracked = git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean);
const changed = [...new Set([...tracked, ...untracked])];
const ownerPrefixes = config.ownerPrefixes;
const visualChanges = changed.filter((file) => ownerPrefixes.some((prefix) => file === prefix || file.startsWith(prefix)));

console.log(`UI freeze: ${config.status}`);
console.log(`Baseline: ${baseline}`);
console.log(`Compared files: ${changed.length}`);

if (visualChanges.length > 0) {
  console.error('UI freeze failed. Visual-owned files changed since the frozen baseline:');
  for (const file of visualChanges) console.error(`- ${file}`);
  console.error('Review the visual change after main release, then deliberately create a new freeze baseline.');
  process.exit(1);
}

console.log('UI freeze passed: no visual-owned files changed.');
