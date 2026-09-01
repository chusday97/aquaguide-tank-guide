import { execFileSync } from 'node:child_process';

const DOC_ONLY = [
  /^\.ai\//,
  /^HANDOFF\.md$/,
  /^PROGRESS\.md$/,
  /(^|\/)README\.md$/,
];

function changedFiles() {
  if (process.env.VERCEL_CHANGED_FILES) {
    return process.env.VERCEL_CHANGED_FILES.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  }
  const base = process.env.VERCEL_GIT_PREVIOUS_SHA || '';
  try {
    const args = base
      ? ['diff', '--name-only', base, 'HEAD']
      : ['diff', '--name-only', 'HEAD^', 'HEAD'];
    return execFileSync('git', args, { encoding: 'utf8' }).split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

const files = changedFiles();
if (!files.length) {
  console.log('Vercel build: continue (unable to prove docs-only change).');
  process.exit(1);
}

const docsOnly = files.every((file) => DOC_ONLY.some((pattern) => pattern.test(file)));
console.log(`Vercel build: ${docsOnly ? 'skip docs-only commit' : 'continue'} (${files.join(', ')})`);
process.exit(docsOnly ? 0 : 1);
