import { execFileSync } from 'node:child_process';

const root = process.cwd();
const repo = process.env.GITHUB_REPOSITORY ?? 'chusday97/aquaguide-tank-guide';
const prNumber = process.env.PREVIEW_PR ?? '142';

function command(name, args) {
  return execFileSync(name, args, { cwd: root, encoding: 'utf8' }).trim();
}

function jsonCommand(name, args) {
  return JSON.parse(command(name, args));
}

function vercelPreviewForSha() {
  try {
    const result = jsonCommand('npx', ['vercel', 'ls', 'aquaguide', '--json']);
    const deployment = result.deployments?.find((candidate) => (
      candidate.state === 'READY'
      && candidate.meta?.githubCommitSha === localSha
      && candidate.meta?.githubCommitRef === branch
    ));
    if (!deployment) return null;
    return {
      status: 'EQUIVALENT',
      deploymentId: deployment.uid ?? deployment.url ?? null,
      sha: deployment.meta.githubCommitSha,
      state: 'success',
      targetUrl: `https://${deployment.url}`
    };
  } catch {
    return null;
  }
}

const localSha = command('git', ['rev-parse', 'HEAD']);
const branch = command('git', ['branch', '--show-current']);
const remoteSha = command('git', ['ls-remote', 'origin', `refs/heads/${branch}`]).split(/\s+/)[0] || null;
const checks = { localSha, branch, remoteSha, remoteSynchronized: remoteSha === localSha };

try {
  const pr = jsonCommand('gh', ['api', `repos/${repo}/pulls/${prNumber}`]);
  checks.prSha = pr.head?.sha ?? null;
  checks.prState = pr.state ?? null;
  checks.prIsDraft = Boolean(pr.draft);
  checks.prSynchronized = checks.prSha === localSha;
} catch (error) {
  checks.githubError = error instanceof Error ? error.message : String(error);
}

try {
  const deployments = jsonCommand('gh', ['api', `repos/${repo}/deployments?sha=${localSha}`]);
  const preview = deployments.find((deployment) => deployment.environment === 'Preview' && deployment.sha === localSha);
  if (!preview) {
    checks.preview = vercelPreviewForSha() ?? { status: 'UNVERIFIED', reason: 'No Preview deployment reports the exact candidate SHA.' };
  } else {
    const statuses = jsonCommand('gh', ['api', `repos/${repo}/deployments/${preview.id}/statuses`]);
    checks.preview = {
      status: statuses[0]?.state === 'success' ? 'EQUIVALENT' : 'UNVERIFIED',
      deploymentId: preview.id,
      sha: preview.sha,
      state: statuses[0]?.state ?? null,
      targetUrl: statuses[0]?.target_url ?? null
    };
  }
} catch (error) {
  checks.preview = { status: 'UNVERIFIED', reason: error instanceof Error ? error.message : String(error) };
}

console.log(JSON.stringify(checks, null, 2));
const passed = checks.remoteSynchronized && checks.prSynchronized && checks.preview?.status === 'EQUIVALENT';
if (!passed) {
  console.error('Preview parity gate: FAILED/UNVERIFIED');
  process.exit(1);
}
console.log('Preview parity gate: PASS');
