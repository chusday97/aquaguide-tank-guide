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
    repo_readable: access.content_repo_readable,
    contents_write_capable: access.content_contents_write_capable,
    content_repo_readable: access.content_repo_readable,
    content_contents_write_capable: access.content_contents_write_capable,
    draft_branch_ready: access.draft_branch_ready,
    content_store_readable: access.content_store_readable,
    staging_repo_readable: access.staging_repo_readable,
    staging_contents_write_capable: access.staging_contents_write_capable,
    staging_branch_ready: access.staging_branch_ready,
    repo_access_error: access.error_code,
    repo: repo.contentRepo,
    content_repo: repo.contentRepo,
    staging_repo: repo.stagingRepo,
    draft_branch: repo.draftBranch,
    source_branch: repo.sourceBranch,
    staging_branch: repo.stagingBranch,
    content_path: repo.contentPath,
    staging_snapshot_path: repo.stagingSnapshotPath,
    authenticated: Boolean(getRequestSession(req)),
  });
}
