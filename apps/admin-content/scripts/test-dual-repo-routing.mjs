import assert from 'node:assert/strict';

process.env.ADMIN_GITHUB_TOKEN = 'test-token';
process.env.ADMIN_GITHUB_CONTENT_REPO = 'chusday97/aquaguide-seo-content';
process.env.ADMIN_GITHUB_STAGING_REPO = 'chusday97/aquaguide-tank-guide';
process.env.ADMIN_GITHUB_DRAFT_BRANCH = 'seo-admin-drafts';
process.env.ADMIN_GITHUB_SOURCE_BRANCH = 'main';
process.env.ADMIN_GITHUB_STAGING_BRANCH = 'feature/admin-content-v0';
process.env.ADMIN_GITHUB_CONTENT_PATH = 'content/species-seo/admin-store.json';
process.env.ADMIN_GITHUB_STAGING_SNAPSHOT_PATH = 'content/species-seo/staging-snapshot.json';

const requests = [];
const contentStore = { schema_version: 1, species_seo: [], species_seo_groups: [], species_data_reviews: [], content_revisions: [] };
function jsonResponse(status, body) {
  return { status, async text() { return JSON.stringify(body); } };
}

global.fetch = async (url, options = {}) => {
  const method = options.method || 'GET';
  requests.push({ url, method, body: options.body ? JSON.parse(options.body) : null });

  if (url.endsWith('/repos/chusday97/aquaguide-seo-content')) {
    return jsonResponse(200, { permissions: { push: true } });
  }
  if (url.endsWith('/repos/chusday97/aquaguide-tank-guide')) {
    return jsonResponse(200, { permissions: { push: true } });
  }
  if (url.includes('/repos/chusday97/aquaguide-seo-content/git/ref/heads/seo-admin-drafts')) {
    return jsonResponse(200, { object: { sha: 'draft-ref-sha' } });
  }
  if (url.includes('/repos/chusday97/aquaguide-tank-guide/git/ref/heads/feature/admin-content-v0')) {
    return jsonResponse(200, { object: { sha: 'staging-ref-sha' } });
  }
  if (url.includes('/repos/chusday97/aquaguide-seo-content/contents/content/species-seo/admin-store.json')) {
    if (method === 'PUT') return jsonResponse(200, { content: { sha: 'content-new-sha' }, commit: { sha: 'content-commit-sha' } });
    return jsonResponse(200, {
      sha: 'content-old-sha', encoding: 'base64', content: Buffer.from(JSON.stringify(contentStore)).toString('base64'),
    });
  }
  if (url.includes('/repos/chusday97/aquaguide-tank-guide/contents/content/species-seo/staging-snapshot.json')) {
    if (method === 'PUT') return jsonResponse(200, { content: { sha: 'staging-new-sha' }, commit: { sha: 'staging-commit-sha' } });
    return jsonResponse(404, { message: 'Not Found' });
  }
  return jsonResponse(500, { message: `Unexpected request: ${method} ${url}` });
};

const { getRepoConfig, probeRepoAccess, updateDraftJson, writeStagingSnapshot } = await import('../../../server/admin-repo/github.mjs');
const cfg = getRepoConfig();
assert.equal(cfg.contentRepo, 'chusday97/aquaguide-seo-content');
assert.equal(cfg.stagingRepo, 'chusday97/aquaguide-tank-guide');
assert.notEqual(cfg.contentRepo, cfg.stagingRepo);

const probe = await probeRepoAccess();
assert.equal(probe.content_repo_readable, true);
assert.equal(probe.content_contents_write_capable, true);
assert.equal(probe.draft_branch_ready, true);
assert.equal(probe.content_store_readable, true);
assert.equal(probe.staging_repo_readable, true);
assert.equal(probe.staging_contents_write_capable, true);
assert.equal(probe.staging_branch_ready, true);
assert.equal(probe.error_code, '');

await updateDraftJson((store) => ({ ...store, updated_at: '2026-09-01T00:00:00.000Z' }), 'content(seo): test private draft write');
await writeStagingSnapshot({ environment: 'staging', delivery_mode: 'staging_release', selected_catalog_keys: ['sp_0001'] });

const puts = requests.filter((request) => request.method === 'PUT');
assert.equal(puts.length, 2);
assert.match(puts[0].url, /repos\/chusday97\/aquaguide-seo-content\/contents\/content\/species-seo\/admin-store\.json/);
assert.match(puts[1].url, /repos\/chusday97\/aquaguide-tank-guide\/contents\/content\/species-seo\/staging-snapshot\.json/);
assert.ok(!puts[0].url.includes('aquaguide-tank-guide'), 'Draft writes must never hit the public AquaGuide repository.');
assert.ok(!puts[1].url.includes('aquaguide-seo-content'), 'Staging snapshots must not remain trapped in the private content repository.');

console.log(JSON.stringify({ gate: 'PASS', private_draft_repo: true, public_staging_repo: true, routed_puts: puts.length }));
