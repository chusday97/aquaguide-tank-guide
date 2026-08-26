import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const state = JSON.parse(readFileSync('.ai/PROJECT_STATE.json', 'utf8'));
const vercelRepo = JSON.parse(readFileSync('.vercel/repo.json', 'utf8'));
const project = vercelRepo.projects?.[0];

const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const localSha = git(['rev-parse', 'HEAD']);
const remoteSha = git(['rev-parse', `origin/${state.canonicalBranch}`]);
const vercelBin = process.env.VERCEL_BIN || null;
const vercelArgs = (args) => vercelBin
  ? { file: vercelBin, args }
  : { file: 'npx', args: ['--yes', 'vercel', ...args] };

const result = {
  canonicalBranch: state.canonicalBranch,
  localSha,
  remoteSha,
  localRemoteParity: localSha === remoteSha,
  vercel: {
    project: project?.name ?? null,
    branch: state.canonicalBranch,
    deploymentSha: null,
    deploymentUrl: null,
    deploymentState: null,
  },
  status: 'AUTH_REQUIRED',
};

let deployments;
try {
  const command = vercelArgs(['ls', project?.name ?? 'aquaguide', '--json']);
  const raw = execFileSync(command.file, command.args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  deployments = JSON.parse(raw).deployments ?? [];
} catch {
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = 2;
}

if (deployments) {
  const branchDeployments = deployments
    .filter((deployment) => deployment.meta?.githubCommitRef === state.canonicalBranch)
    .sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0));
  const latest = branchDeployments[0];

  if (latest) {
    result.vercel.deploymentSha = latest.meta?.githubCommitSha ?? null;
    result.vercel.deploymentUrl = latest.url ?? null;
    result.vercel.deploymentState = latest.state ?? null;
    result.status = result.localRemoteParity && result.vercel.deploymentSha === localSha
      ? 'PASS'
      : 'NOT_SYNCHRONIZED';
  }

  console.log(JSON.stringify(result, null, 2));
  if (result.status === 'NOT_SYNCHRONIZED') process.exitCode = 1;
  if (result.status === 'AUTH_REQUIRED') process.exitCode = 2;
}
