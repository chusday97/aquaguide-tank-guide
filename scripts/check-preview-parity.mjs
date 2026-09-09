import { execFileSync } from 'node:child_process';

const root = process.cwd();
const repository = process.env.GITHUB_REPOSITORY ?? 'chusday97/aquaguide-tank-guide';
const previewPr = process.env.PREVIEW_PR;
const project = process.env.VERCEL_PROJECT ?? 'aquaguide';

const run = (name, args) => execFileSync(name, args, { cwd: root, encoding: 'utf8' }).trim();
const readJson = (name, args) => JSON.parse(run(name, args));
const failure = (error) => error instanceof Error ? error.message : String(error);

if (!previewPr) {
  console.error('Preview parity gate: PREVIEW_PR is required');
  process.exit(1);
}

const localSha = run('git', ['rev-parse', 'HEAD']);
const branch = run('git', ['branch', '--show-current']);
const remoteSha = run('git', ['ls-remote', 'origin', `refs/heads/${branch}`]).split(/\s+/)[0] || null;
const checks = {
  localSha,
  branch,
  remoteSha,
  remoteSynchronized: remoteSha === localSha,
  previewPr: Number(previewPr),
};

try {
  const pr = readJson('gh', ['api', `repos/${repository}/pulls/${previewPr}`]);
  checks.pr = {
    state: pr.state ?? null,
    draft: Boolean(pr.draft),
    base: pr.base?.ref ?? null,
    head: pr.head?.ref ?? null,
    sha: pr.head?.sha ?? null,
  };
  checks.prSynchronized = checks.pr.state === 'open'
    && checks.pr.draft
    && checks.pr.base === 'main'
    && checks.pr.head === branch
    && checks.pr.sha === localSha;
} catch (error) {
  checks.prError = failure(error);
  checks.prSynchronized = false;
}

try {
  const deployments = readJson('npx', ['vercel', 'ls', project, '--json']);
  const deployment = deployments.deployments?.find((item) => (
    item.state === 'READY'
    && item.meta?.githubCommitSha === localSha
    && item.meta?.githubCommitRef === branch
  ));
  checks.preview = deployment
    ? { status: 'EQUIVALENT', state: deployment.state, sha: localSha, targetUrl: `https://${deployment.url}` }
    : { status: 'UNVERIFIED', reason: 'No READY Vercel Preview reports the exact branch SHA.' };
} catch (error) {
  checks.preview = { status: 'UNVERIFIED', reason: failure(error) };
}

console.log(JSON.stringify(checks, null, 2));
const passed = checks.remoteSynchronized && checks.prSynchronized && checks.preview?.status === 'EQUIVALENT';
if (!passed) {
  console.error('Preview parity gate: FAILED/UNVERIFIED');
  process.exit(1);
}
console.log('Preview parity gate: PASS');
