import { getRequestSession, isRepoAuthConfigured } from '../../server/admin-repo/auth.mjs';
import { getRepoConfig, probeRepoAccess } from '../../server/admin-repo/github.mjs';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ ok: false });
  const repo = getRepoConfig();
  const access = await probeRepoAccess();
  return res.status(200).json({
    ok: true,
    backend: 'github-repo',
    auth_configured: isRepoAuthConfigured(),
    github_token_configured: access.token_configured,
    repo_readable: access.repo_readable,
    contents_write_capable: access.contents_write_capable,
    draft_branch_ready: access.draft_branch_ready,
    content_store_readable: access.content_store_readable,
    repo_access_error: access.error_code,
    repo: repo.repo,
    draft_branch: repo.draftBranch,
    source_branch: repo.sourceBranch,
    content_path: repo.contentPath,
    authenticated: Boolean(getRequestSession(req)),
  });
}
