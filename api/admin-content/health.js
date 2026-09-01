import { getRequestSession, isRepoAuthConfigured } from '../../server/admin-repo/auth.mjs';
import { getRepoConfig } from '../../server/admin-repo/github.mjs';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ ok: false });
  const repo = getRepoConfig();
  return res.status(200).json({
    ok: true,
    backend: 'github-repo',
    auth_configured: isRepoAuthConfigured(),
    github_token_configured: Boolean(repo.token),
    repo: repo.repo,
    draft_branch: repo.draftBranch,
    source_branch: repo.sourceBranch,
    content_path: repo.contentPath,
    authenticated: Boolean(getRequestSession(req)),
  });
}
