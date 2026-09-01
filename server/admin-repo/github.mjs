import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const API_VERSION = '2022-11-28';

function config() {
  const localFile = process.env.ADMIN_REPO_LOCAL_FILE || '';
  const localStagingFile = process.env.ADMIN_REPO_LOCAL_STAGING_FILE || '';
  const owner = process.env.VERCEL_GIT_REPO_OWNER || 'chusday97';
  const slug = process.env.VERCEL_GIT_REPO_SLUG || 'aquaguide-tank-guide';
  const repo = process.env.ADMIN_GITHUB_REPO || `${owner}/${slug}`;
  const token = process.env.ADMIN_GITHUB_TOKEN || '';
  const draftBranch = process.env.ADMIN_GITHUB_DRAFT_BRANCH || 'seo-admin-drafts';
  const sourceBranch = process.env.ADMIN_GITHUB_SOURCE_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main';
  const contentPath = process.env.ADMIN_GITHUB_CONTENT_PATH || 'content/species-seo/admin-store.json';
  return { repo, token, draftBranch, sourceBranch, contentPath, localFile, localStagingFile };
}

function headers(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': API_VERSION,
    'Content-Type': 'application/json',
  };
}

function repoUrl(repo, suffix) {
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

async function getRefSha(branch) {
  const { repo } = config();
  const ref = `heads/${branch}`.split('/').map(encodeURIComponent).join('/');
  const body = await githubFetch(repoUrl(repo, `/git/ref/${ref}`));
  return body?.object?.sha || '';
}


export async function probeRepoAccess() {
  const cfg = config();
  const base = {
    token_configured: Boolean(cfg.token),
    repo_readable: false,
    contents_write_capable: false,
    draft_branch_ready: false,
    content_store_readable: false,
    error_code: cfg.token ? '' : 'token_missing',
  };
  if (!cfg.token) return base;
  try {
    const repoInfo = await githubFetch(repoUrl(cfg.repo, ''));
    base.repo_readable = true;
    base.contents_write_capable = Boolean(repoInfo?.permissions?.push || repoInfo?.permissions?.admin || repoInfo?.permissions?.maintain);
    try {
      await getRefSha(cfg.draftBranch);
      base.draft_branch_ready = true;
    } catch (error) {
      if (error.status !== 404) throw error;
    }
    if (base.draft_branch_ready) {
      const store = await readRepoJson({ branch: cfg.draftBranch, filePath: cfg.contentPath, allowMissing: true });
      base.content_store_readable = Boolean(store);
    }
    base.error_code = base.contents_write_capable ? '' : 'contents_write_missing';
    return base;
  } catch (error) {
    return { ...base, error_code: error.status === 401 ? 'token_invalid' : error.status === 403 ? 'token_forbidden' : 'repo_unavailable' };
  }
}

export async function ensureDraftBranch() {
  const { repo, draftBranch, sourceBranch, localFile } = config();
  if (localFile) return draftBranch;
  try {
    await getRefSha(draftBranch);
    return draftBranch;
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  const sourceSha = await getRefSha(sourceBranch);
  try {
    await githubFetch(repoUrl(repo, '/git/refs'), {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${draftBranch}`, sha: sourceSha }),
    }, [201]);
  } catch (error) {
    if (error.status !== 422) throw error;
  }
  return draftBranch;
}

export async function readRepoJson({ branch, filePath, allowMissing = false } = {}) {
  const cfg = config();
  if (cfg.localFile) {
    try {
      const text = await readFile(cfg.localFile, 'utf8');
      return { data: JSON.parse(text), sha: '', branch: branch || cfg.draftBranch, path: cfg.localFile };
    } catch (error) {
      if (allowMissing && error?.code === 'ENOENT') return null;
      throw error;
    }
  }
  const targetBranch = branch || cfg.draftBranch;
  const targetPath = filePath || cfg.contentPath;
  try {
    const body = await githubFetch(repoUrl(cfg.repo, `/contents/${encodePath(targetPath)}?ref=${encodeURIComponent(targetBranch)}`));
    const content = Buffer.from(String(body.content || '').replace(/\n/g, ''), 'base64').toString('utf8');
    return { data: JSON.parse(content), sha: body.sha, branch: targetBranch, path: targetPath };
  } catch (error) {
    if (allowMissing && error.status === 404) return null;
    throw error;
  }
}

export async function writeRepoJson({ branch, filePath, data, message, expectedSha } = {}) {
  const cfg = config();
  if (cfg.localFile) {
    await mkdir(path.dirname(cfg.localFile), { recursive: true });
    await writeFile(cfg.localFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    return { commitSha: 'local', contentSha: 'local', branch: branch || cfg.draftBranch, path: cfg.localFile };
  }
  const targetBranch = branch || cfg.draftBranch;
  const targetPath = filePath || cfg.contentPath;
  const payload = {
    message: message || 'chore(seo): update admin content store',
    content: Buffer.from(`${JSON.stringify(data, null, 2)}\n`, 'utf8').toString('base64'),
    branch: targetBranch,
  };
  if (expectedSha) payload.sha = expectedSha;
  const body = await githubFetch(repoUrl(cfg.repo, `/contents/${encodePath(targetPath)}`), {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, [200, 201]);
  return { commitSha: body?.commit?.sha || '', contentSha: body?.content?.sha || '', branch: targetBranch, path: targetPath };
}

export async function readDraftJsonWithFallback(defaultData) {
  const cfg = config();
  await ensureDraftBranch();
  const draft = await readRepoJson({ branch: cfg.draftBranch, filePath: cfg.contentPath, allowMissing: true });
  if (draft) return draft;
  const source = await readRepoJson({ branch: cfg.sourceBranch, filePath: cfg.contentPath, allowMissing: true });
  return source || { data: structuredClone(defaultData), sha: '', branch: cfg.draftBranch, path: cfg.contentPath };
}

export async function updateDraftJson(mutator, message) {
  const cfg = config();
  await ensureDraftBranch();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readRepoJson({ branch: cfg.draftBranch, filePath: cfg.contentPath, allowMissing: true });
    const base = current?.data || {};
    const next = await mutator(structuredClone(base));
    try {
      const result = await writeRepoJson({
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
    return { commitSha: 'local-staging', contentSha: 'local-staging', branch: 'local-staging', path: cfg.localStagingFile };
  }
  const targetBranch = process.env.ADMIN_GITHUB_STAGING_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || '';
  if (!targetBranch) throw new Error('ADMIN_GITHUB_STAGING_BRANCH is required outside a Vercel Git deployment.');
  if (['main', 'master'].includes(targetBranch) && process.env.ADMIN_ALLOW_PRODUCTION_PUBLISH !== 'true') {
    throw new Error('Production branch publishing is locked. Configure a non-production staging branch.');
  }
  const filePath = process.env.ADMIN_GITHUB_STAGING_SNAPSHOT_PATH || 'content/species-seo/staging-snapshot.json';
  const current = await readRepoJson({ branch: targetBranch, filePath, allowMissing: true });
  return writeRepoJson({
    branch: targetBranch,
    filePath,
    data: snapshot,
    expectedSha: current?.sha || '',
    message: `content(seo): publish staging ${snapshot.selected_catalog_keys?.join(', ') || 'selection'}`,
  });
}
