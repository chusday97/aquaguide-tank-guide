import assert from 'node:assert/strict';
import { resolveBuildInputs } from './build-species-seo-artifact.mjs';

const saved = Object.fromEntries([
  'VERCEL_ENV','VERCEL_GIT_COMMIT_REF','VERCEL_GIT_COMMIT_MESSAGE','VERCEL_CHANGED_FILES','VERCEL_BRANCH_URL','VERCEL_URL','VERCEL_PROJECT_PRODUCTION_URL',
].map((key) => [key, process.env[key]]));

try {
  process.env.VERCEL_ENV = 'preview';
  process.env.VERCEL_GIT_COMMIT_REF = 'feature/admin-content-v0';
  process.env.VERCEL_BRANCH_URL = 'aquaguide-feature.example.vercel.app';
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'aqua-tank-guide.vercel.app';

  process.env.VERCEL_GIT_COMMIT_MESSAGE = 'fix(admin): normal code change';
  process.env.VERCEL_CHANGED_FILES = 'apps/admin-content/src/App.jsx';
  let inputs = resolveBuildInputs();
  assert.equal(inputs.snapshotPath, '', 'Normal code Preview must not consume the committed staging snapshot.');
  assert.equal(inputs.source, 'none');
  assert.equal(inputs.siteUrl, '', 'Normal code Preview does not need a Species publication host.');

  process.env.VERCEL_GIT_COMMIT_MESSAGE = 'content(seo): publish staging sp_0001';
  process.env.VERCEL_CHANGED_FILES = 'content/species-seo/staging-snapshot.json';
  inputs = resolveBuildInputs();
  assert.equal(inputs.snapshotPath, 'content/species-seo/staging-snapshot.json', 'Explicit Staging publication commit must consume the sanitized snapshot.');
  assert.equal(inputs.source, 'vercel-explicit-staging-publish');
  assert.equal(inputs.siteUrl, 'https://aquaguide-feature.example.vercel.app');

  process.env.VERCEL_CHANGED_FILES = 'content/species-seo/staging-snapshot.json\napps/admin-content/src/App.jsx';
  inputs = resolveBuildInputs();
  assert.equal(inputs.snapshotPath, '', 'Mixed code/content commits must not impersonate an explicit Staging publish.');

  process.env.VERCEL_GIT_COMMIT_REF = 'main';
  process.env.VERCEL_CHANGED_FILES = 'content/species-seo/staging-snapshot.json';
  inputs = resolveBuildInputs();
  assert.equal(inputs.snapshotPath, '', 'Production/default branch must never auto-consume the staging snapshot.');

  process.env.VERCEL_GIT_COMMIT_REF = 'feature/admin-content-v0';
  process.env.VERCEL_GIT_COMMIT_MESSAGE = 'fix(admin): normal code change';
  process.env.VERCEL_CHANGED_FILES = 'apps/admin-content/src/App.jsx';
  inputs = resolveBuildInputs({ snapshotPath: 'apps/admin-content/fixtures/staging-publication-sample.json', siteUrl: 'https://ci.aquaguide.test' });
  assert.equal(inputs.source, 'explicit', 'Explicit CI/local snapshot configuration must keep working.');
  assert.equal(inputs.snapshotPath, 'apps/admin-content/fixtures/staging-publication-sample.json');

  console.log('Species SEO build routing verified: code deploys skip content; explicit Staging publish commits consume snapshot.');
} finally {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
}
