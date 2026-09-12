import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_VERSION = '2022-11-28';

function config() {
  const localFile = process.env.ADMIN_REPO_LOCAL_FILE || '';
  const localStagingFile = process.env.ADMIN_REPO_LOCAL_STAGING_FILE || '';
  const owner = process.env.VERCEL_GIT_REPO_OWNER || 'chusday97';
  const slug = process.env.VERCEL_GIT_REPO_SLUG || 'aquaguide-tank-guide';
  const appRepo = `${owner}/${slug}`;
  const contentRepo = process.env.ADMIN_GITHUB_CONTENT_REPO || '';
  const stagingRepo = process.env.ADMIN_GITHUB_STAGING_REPO || appRepo;
  const token = process.env.ADMIN_GITHUB_TOKEN || '';
  const draftBranch = process.env.ADMIN_GITHUB_DRAFT_BRANCH || 'seo-admin-drafts';
  const sourceBranch = process.env.ADMIN_GITHUB_SOURCE_BRANCH || 'main';
  const stagingBranch = process.env.ADMIN_GITHUB_STAGING_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || '';
  const contentPath = process.env.ADMIN_GITHUB_CONTENT_PATH || 'content/species-seo/admin-store.json';
  const stagingSnapshotPath = process.env.ADMIN_GITHUB_STAGING_SNAPSHOT_PATH || 'content/species-seo/staging-snapshot.json';
  return {
    repo: contentRepo,
    appRepo,
    contentRepo,
    stagingRepo,
    token,
    draftBranch,
    sourceBranch,
    stagingBranch,
    contentPath,
    stagingSnapshotPath,
    localFile,
    localStagingFile,
  };
}

function headers(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': API_VERSION,
    'Content-Type': 'application/json',
  };
}

function repoUrl(repo, suffix = '') {
  return `https://api.github.com/repos/${repo}${suffix}`;
}

function encodePath(value) {
  return String(value).split('/').map(encodeURIComponent).join('/');
}

async function githubFetch(url, options = {}, expected = [200]) {
  const { token } = config();
  if (!token) throw new Error('ADMIN_GITHUB_TOKEN is not configured.');
  const response = await fetch(url, { ...options, headers: { ...headers(token), ...(options.headers || {}) } });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!expected.includes(response.status)) {
    const error = new Error(body?.message || `GitHub API ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

export function getRepoConfig() {
  const value = config();
  return { ...value, token: value.token ? '[configured]' : '' };
}

async function getRefSha(repo, branch) {
  const ref = `heads/${branch}`.split('/').map(encodeURIComponent).join('/');
  const body = await githubFetch(repoUrl(repo, `/git/ref/${ref}`));
  return body?.object?.sha || '';
}

async function getRepoPermission(repo) {
  const info = await githubFetch(repoUrl(repo));
  return {
    readable: true,
    writable: Boolean(info?.permissions?.push || info?.permissions?.admin || info?.permissions?.maintain),
  };
}

export async function probeRepoAccess() {
  const cfg = config();
  const base = {
    token_configured: Boolean(cfg.token),
    repo_readable: false,
    contents_write_capable: false,
    content_repo_readable: false,
    content_contents_write_capable: false,
    draft_branch_ready: false,
    content_store_readable: false,
    staging_repo_readable: false,
    staging_contents_write_capable: false,
    staging_branch_ready: false,
    error_code: cfg.token ? '' : 'token_missing',
  };
  if (!cfg.contentRepo) return { ...base, error_code: 'content_repo_not_configured' };
  if (!cfg.stagingRepo) return { ...base, error_code: 'staging_repo_not_configured' };
  if (!cfg.token) return base;
  try {
    const contentPermission = await getRepoPermission(cfg.contentRepo);
    base.repo_readable = contentPermission.readable;
    base.contents_write_capable = contentPermission.writable;
    base.content_repo_readable = contentPermission.readable;
    base.content_contents_write_capable = contentPermission.writable;
    if (!contentPermission.writable) {
      base.error_code = 'content_write_missing';
      return base;
    }
    try {
      await getRefSha(cfg.contentRepo, cfg.draftBranch);
      base.draft_branch_ready = true;
    } catch (error) {
      if (error.status !== 404) throw error;
    }
    if (!base.draft_branch_ready) {
      base.error_code = 'draft_branch_missing';
      return base;
    }
    const store = await readRepoJson({ repo: cfg.contentRepo, branch: cfg.draftBranch, filePath: cfg.contentPath, allowMissing: true });
    base.content_store_readable = Boolean(store);
    if (!base.content_store_readable) {
      base.error_code = 'content_store_missing';
      return base;
    }

    const stagingPermission = await getRepoPermission(cfg.stagingRepo);
    base.staging_repo_readable = stagingPermission.readable;
    base.staging_contents_write_capable = stagingPermission.writable;
    if (!stagingPermission.writable) {
      base.error_code = 'staging_write_missing';
      return base;
    }
    if (cfg.stagingBranch) {
      try {
        await getRefSha(cfg.stagingRepo, cfg.stagingBranch);
        base.staging_branch_ready = true;
      } catch (error) {
        if (error.status !== 404) throw error;
      }
    }
    base.error_code = base.staging_branch_ready ? '' : 'staging_branch_missing';
    return base;
  } catch (error) {
    return {
      ...base,
      error_code: error.status === 401
        ? 'token_invalid'
        : error.status === 403
          ? 'token_forbidden'
          : 'repo_unavailable',
    };
  }
}

export async function ensureDraftBranch() {
  const cfg = config();
  if (cfg.localFile) return cfg.draftBranch;
  if (!cfg.contentRepo) throw new Error('ADMIN_GITHUB_CONTENT_REPO is required. Drafts must never fall back to the public application repository.');
  try {
    await getRefSha(cfg.contentRepo, cfg.draftBranch);
    return cfg.draftBranch;
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  const sourceSha = await getRefSha(cfg.contentRepo, cfg.sourceBranch);
  try {
    await githubFetch(repoUrl(cfg.contentRepo, '/git/refs'), {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${cfg.draftBranch}`, sha: sourceSha }),
    }, [201]);
  } catch (error) {
    if (error.status !== 422) throw error;
  }
  return cfg.draftBranch;
}

async function readBlobJson(repo, sha) {
  const blob = await githubFetch(repoUrl(repo, `/git/blobs/${encodeURIComponent(sha)}`));
  const text = Buffer.from(String(blob?.content || '').replace(/\n/g, ''), 'base64').toString('utf8');
  return JSON.parse(text);
}

export async function readRepoJson({ repo, branch, filePath, allowMissing = false } = {}) {
  const cfg = config();
  if (cfg.localFile && (!repo || repo === cfg.contentRepo)) {
    try {
      const text = await readFile(cfg.localFile, 'utf8');
      return { data: JSON.parse(text), sha: '', repo: cfg.contentRepo, branch: branch || cfg.draftBranch, path: cfg.localFile };
    } catch (error) {
      if (allowMissing && error?.code === 'ENOENT') return null;
      throw error;
    }
  }
  const targetRepo = repo || cfg.contentRepo;
  const targetBranch = branch || cfg.draftBranch;
  const targetPath = filePath || cfg.contentPath;
  try {
    const body = await githubFetch(repoUrl(targetRepo, `/contents/${encodePath(targetPath)}?ref=${encodeURIComponent(targetBranch)}`));
    const data = body?.encoding === 'base64' && body?.content
      ? JSON.parse(Buffer.from(String(body.content).replace(/\n/g, ''), 'base64').toString('utf8'))
      : await readBlobJson(targetRepo, body.sha);
    return { data, sha: body.sha, repo: targetRepo, branch: targetBranch, path: targetPath };
  } catch (error) {
    if (allowMissing && error.status === 404) return null;
    throw error;
  }
}

export async function writeRepoJson({ repo, branch, filePath, data, message, expectedSha } = {}) {
  const cfg = config();
  const targetRepo = repo || cfg.contentRepo;
  if (cfg.localFile && targetRepo === cfg.contentRepo) {
    await mkdir(path.dirname(cfg.localFile), { recursive: true });
    await writeFile(cfg.localFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    return { commitSha: 'local', contentSha: 'local', repo: targetRepo, branch: branch || cfg.draftBranch, path: cfg.localFile };
  }
  const targetBranch = branch || cfg.draftBranch;
  const targetPath = filePath || cfg.contentPath;
  const payload = {
    message: message || 'chore(seo): update admin content store',
    content: Buffer.from(`${JSON.stringify(data, null, 2)}\n`, 'utf8').toString('base64'),
    branch: targetBranch,
  };
  if (expectedSha) payload.sha = expectedSha;
  const body = await githubFetch(repoUrl(targetRepo, `/contents/${encodePath(targetPath)}`), {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, [200, 201]);
  return {
    commitSha: body?.commit?.sha || '',
    contentSha: body?.content?.sha || '',
    repo: targetRepo,
    branch: targetBranch,
    path: targetPath,
  };
}

export async function readDraftJsonWithFallback(defaultData) {
  const cfg = config();
  await ensureDraftBranch();
  const draft = await readRepoJson({ repo: cfg.contentRepo, branch: cfg.draftBranch, filePath: cfg.contentPath, allowMissing: true });
  if (draft) return draft;
  const source = await readRepoJson({ repo: cfg.contentRepo, branch: cfg.sourceBranch, filePath: cfg.contentPath, allowMissing: true });
  return source || { data: structuredClone(defaultData), sha: '', repo: cfg.contentRepo, branch: cfg.draftBranch, path: cfg.contentPath };
}

export async function updateDraftJson(mutator, message) {
  const cfg = config();
  await ensureDraftBranch();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readRepoJson({ repo: cfg.contentRepo, branch: cfg.draftBranch, filePath: cfg.contentPath, allowMissing: true });
    const base = current?.data || {};
    const next = await mutator(structuredClone(base));
    try {
      const result = await writeRepoJson({
        repo: cfg.contentRepo,
        branch: cfg.draftBranch,
        filePath: cfg.contentPath,
        data: next,
        message,
        expectedSha: current?.sha || '',
      });
      return { data: next, ...result };
    } catch (error) {
      if (error.status !== 409 && error.status !== 422) throw error;
      if (attempt === 2) throw new Error('Draft content changed concurrently; please reload and retry.');
    }
  }
  throw new Error('Unable to update draft content.');
}

export async function writeStagingSnapshot(snapshot) {
  const cfg = config();
  if (cfg.localStagingFile) {
    await mkdir(path.dirname(cfg.localStagingFile), { recursive: true });
    await writeFile(cfg.localStagingFile, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    return { commitSha: 'local-staging', contentSha: 'local-staging', repo: 'local-staging', branch: 'local-staging', path: cfg.localStagingFile };
  }
  if (!cfg.stagingBranch) throw new Error('ADMIN_GITHUB_STAGING_BRANCH is required outside a Vercel Git deployment.');
  if (['main', 'master'].includes(cfg.stagingBranch) && process.env.ADMIN_ALLOW_PRODUCTION_PUBLISH !== 'true') {
    throw new Error('Production branch publishing is locked. Configure a non-production staging branch.');
  }
  const current = await readRepoJson({
    repo: cfg.stagingRepo,
    branch: cfg.stagingBranch,
    filePath: cfg.stagingSnapshotPath,
    allowMissing: true,
  });
  return writeRepoJson({
    repo: cfg.stagingRepo,
    branch: cfg.stagingBranch,
    filePath: cfg.stagingSnapshotPath,
    data: snapshot,
    expectedSha: current?.sha || '',
    message: `content(seo): publish staging ${snapshot.selected_catalog_keys?.join(', ') || 'selection'}`,
  });
}
