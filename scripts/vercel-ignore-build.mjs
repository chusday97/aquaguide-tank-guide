import { execFileSync } from 'node:child_process';

const NON_RUNTIME_ONLY = [
  /^\.ai\//,
  /^HANDOFF\.md$/,
  /^PROGRESS\.md$/,
  /(^|\/)README\.md$/,
  /^content\/care-seo\/staging-acceptance\.json$/,
  /^content\/care-seo\/release-decision\.json$/,
  /^scripts\/check-preview-parity\.mjs$/,
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
  console.log('Vercel build: continue (unable to prove non-runtime-only change).');
  process.exit(1);
}

const nonRuntimeOnly = files.every((file) => NON_RUNTIME_ONLY.some((pattern) => pattern.test(file)));
console.log(`Vercel build: ${nonRuntimeOnly ? 'skip docs/evidence-only commit' : 'continue'} (${files.join(', ')})`);
process.exit(nonRuntimeOnly ? 0 : 1);
