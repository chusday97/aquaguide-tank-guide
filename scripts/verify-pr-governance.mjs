import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = (file) => readFileSync(file, 'utf8');
const registry = read('.ai/OPEN_PR_REGISTRY.md');
const cleanup = read('docs/03-development/PR_CLEANUP_RECORD.md');
const inventory = read('docs/05-validation/MODULE_FACT_INVENTORY.md');

const requiredStatuses = [
  'CURRENT_VERIFIED',
  'DEPLOYED_REVERIFY_PENDING',
  'PARTIAL_WITH_FALLBACK',
  'RC_MIGRATION_PROPOSED',
  'HISTORICAL_OR_EXCLUDED',
];

if (!registry.includes('#141') || !registry.includes('closed, do not merge directly')) {
  throw new Error('PR registry must designate #141 and mark historical inputs closed.');
}
if (!cleanup.includes('exactly one open PR') || !cleanup.includes('No remote branch was deleted')) {
  throw new Error('PR cleanup record must preserve the one-open-PR and no-branch-deletion invariants.');
}
if (!inventory.includes('## Cross-layer invariants')) {
  throw new Error('Module fact inventory is missing cross-layer invariants.');
}
for (const status of requiredStatuses) {
  if (!inventory.includes(status)) throw new Error(`Module fact inventory is missing status: ${status}`);
}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  if (process.env.CI === 'true') {
    throw new Error('CI governance check requires GITHUB_TOKEN for read-only PR topology verification.');
  }
  console.log('PR topology API check: SKIP (no GITHUB_TOKEN in local environment)');
} else {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) throw new Error('GITHUB_REPOSITORY is required for PR topology verification.');
  const response = await fetch(`https://api.github.com/repos/${repository}/pulls?state=open&per_page=100`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) throw new Error(`GitHub PR topology request failed: HTTP ${response.status}`);
  const pulls = await response.json();
  if (pulls.length !== 1 || pulls[0]?.number !== 141) {
    throw new Error(`Expected exactly PR #141 to be open; received ${pulls.map((pull) => `#${pull.number}`).join(', ') || 'none'}.`);
  }
  const pull = pulls[0];
  if (pull.head?.ref !== 'codex/unified-rc-visual-v1' || pull.base?.ref !== 'integration/aquaguide-rc1') {
    throw new Error(`PR #141 topology drifted: ${pull.head?.ref} -> ${pull.base?.ref}`);
  }
  const expectedHeadSha = process.env.EXPECTED_HEAD_SHA || (() => {
    try { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { return ''; }
  })();
  if (expectedHeadSha && pull.head?.sha !== expectedHeadSha) {
    throw new Error(`PR #141 head SHA drifted: ${pull.head?.sha} != ${expectedHeadSha}`);
  }
  console.log(`PR topology API check: PASS (#141 ${pull.head.sha} -> ${pull.base.ref})`);
}

console.log('PR and cross-layer governance contract: PASS');
