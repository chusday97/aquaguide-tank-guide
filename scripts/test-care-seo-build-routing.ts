import assert from 'node:assert/strict';
import { resolveCareSeoBuildInputs } from './build-care-seo-artifact';

const keys = [
  'VERCEL_ENV',
  'VERCEL_GIT_COMMIT_REF',
  'VERCEL_GIT_COMMIT_MESSAGE',
  'VERCEL_CHANGED_FILES',
  'VERCEL_BRANCH_URL',
  'VERCEL_URL',
  'VERCEL_PROJECT_PRODUCTION_URL',
] as const;
const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));

try {
  process.env.VERCEL_ENV = 'preview';
  process.env.VERCEL_GIT_COMMIT_REF = 'feature/admin-content-v0';
  process.env.VERCEL_GIT_COMMIT_MESSAGE = 'content(care-seo): publish staging care_demo';
  process.env.VERCEL_CHANGED_FILES = 'content/care-seo/staging-snapshot.json';
  process.env.VERCEL_BRANCH_URL = 'aquaguide-care-preview.vercel.app';
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'aqua-tank-guide.vercel.app';

  const explicit = resolveCareSeoBuildInputs();
  assert.equal(explicit.snapshotPath, 'content/care-seo/staging-snapshot.json');
  assert.equal(explicit.siteUrl, 'https://aquaguide-care-preview.vercel.app');
  assert.equal(explicit.productionSiteUrl, 'https://aqua-tank-guide.vercel.app');
  assert.equal(explicit.source, 'vercel-explicit-care-staging-publish');

  process.env.VERCEL_GIT_COMMIT_MESSAGE = 'feat(content): unrelated care change';
  assert.equal(resolveCareSeoBuildInputs().snapshotPath, '');

  process.env.VERCEL_GIT_COMMIT_MESSAGE = 'content(care-seo): publish staging care_demo';
  process.env.VERCEL_CHANGED_FILES = 'content/care-seo/staging-snapshot.json\nsrc/App.tsx';
  assert.equal(resolveCareSeoBuildInputs().snapshotPath, '');

  process.env.VERCEL_CHANGED_FILES = 'content/care-seo/staging-snapshot.json';
  process.env.VERCEL_GIT_COMMIT_REF = 'main';
  assert.equal(resolveCareSeoBuildInputs().snapshotPath, '');

  const manual = resolveCareSeoBuildInputs({
    snapshotPath: '/tmp/care-snapshot.json',
    siteUrl: 'https://manual-staging.example.test',
    productionSiteUrl: 'https://aqua-tank-guide.vercel.app',
  });
  assert.equal(manual.source, 'explicit');
  assert.equal(manual.snapshotPath, '/tmp/care-snapshot.json');

  console.log('care SEO build routing: explicit single-file Staging publish only PASS');
} finally {
  for (const key of keys) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
