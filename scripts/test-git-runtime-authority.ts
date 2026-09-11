import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { localCompatibilityAdminStore } from '../src/services/admin/local-compatibility-admin.store';
import { hydrateReviewedCompatibilityEvidence, getRuntimeCompatibilityStatus, resetRuntimeCompatibilityEvidenceForTest } from '../src/data/runtimeCompatibilityEvidence';
import { getRuntimeContentStatus, hydratePublishedContentCatalog, runtimeCareTopicsData, runtimeFishData } from '../src/data/runtimeContentCatalog';
import { resetGitRuntimeAuthoritySnapshotForTest } from '../src/data/gitRuntimeAuthority';
import type { GitRuntimeAuthoritySnapshot } from '../packages/contracts/src';


const committedSnapshot = JSON.parse(await readFile(new URL('../public/runtime-authority.json', import.meta.url), 'utf8')) as GitRuntimeAuthoritySnapshot;
assert.equal(committedSnapshot.authority, 'local-file-git');
assert.equal(typeof committedSnapshot.generatedAt, 'string');
assert.equal(committedSnapshot.compatibility?.authority, 'reviewed-git');
assert.equal(committedSnapshot.compatibility?.profiles.length, 7);
assert.equal(committedSnapshot.compatibility?.pairRules.length, 4);

const localCompatibility = await localCompatibilityAdminStore.getBootstrap();
const compatibility = { ...localCompatibility, authority: 'reviewed-git' as const };
const snapshot: GitRuntimeAuthoritySnapshot = {
  schemaVersion: 1,
  authority: 'local-file-git',
  generatedAt: '2026-09-11T00:00:00.000Z',
  source: { businessUpdatedAt: '2026-09-11T00:00:00.000Z', compatibilityUpdatedAt: '2026-09-11T00:00:00.000Z', compatibilityAuthoritySequence: 1 },
  productCare: {
    species: [{
      version: 2,
      publishedAt: '2026-09-11T00:00:00.000Z',
      assets: [],
      input: { catalogKey: 'sp_0001', name: 'Git Snapshot Fish', scientificName: 'Snapshot fishus', category: '热带鱼', difficulty: 'Easy', waterTemperatureText: '25°C', phLevelText: '7.0', waterChangeCycleDays: 6, description: 'Git published description', diet: 'Omnivore', tankSizeText: '45 L', temperament: 'Peaceful', sizeClass: 'Small', isCustom: false, searchTerms: ['Git Snapshot Fish'] },
    }],
    careArticles: [{
      version: 2,
      publishedAt: '2026-09-11T00:00:00.000Z',
      assets: [],
      input: { catalogKey: 'water_stability', title: 'Git Snapshot Care', category: '水质', urgency: '日常', summary: 'Git published care', symptoms: [], steps: [{ instruction: 'Observe', actionKind: 'observe' }], avoidActions: [], observeItems: [], diagnoseWhen: [], nextStep: 'Continue', keywords: ['git'] },
    }],
  },
  compatibility,
};

const urls: string[] = [];
globalThis.fetch = (async (input: string | URL | Request) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  urls.push(url);
  if (!url.startsWith('/runtime-authority.json')) throw new Error(`unexpected network fallback: ${url}`);
  return new Response(JSON.stringify(snapshot), { status: 200, headers: { 'Content-Type': 'application/json' } });
}) as typeof fetch;

resetGitRuntimeAuthoritySnapshotForTest();
await hydratePublishedContentCatalog('zh-CN');
assert.equal(getRuntimeContentStatus().source, 'git-snapshot');
assert.equal(runtimeFishData.find(item => item.id === 'sp_0001')?.name, 'Git Snapshot Fish');
assert.equal(runtimeCareTopicsData.find(item => item.id === 'water_stability')?.title, 'Git Snapshot Care');
assert(urls.every(url => url.startsWith('/runtime-authority.json')));

const emptyProductCareSnapshot: GitRuntimeAuthoritySnapshot = {
  ...snapshot,
  productCare: { species: [], careArticles: [] },
};
const fallbackUrls: string[] = [];
globalThis.fetch = (async (input: string | URL | Request) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  fallbackUrls.push(url);
  if (url.startsWith('/runtime-authority.json')) return new Response(JSON.stringify(emptyProductCareSnapshot), { status: 200, headers: { 'Content-Type': 'application/json' } });
  if (url.startsWith('/api/v1/content-bootstrap?')) return new Response(JSON.stringify({ data: { species: [], careArticles: [], authority: 'publication-snapshot', publicationCounts: { species: 0, care: 0 } }, requestId: 'git-runtime-authority-test' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  throw new Error(`unexpected network request: ${url}`);
}) as typeof fetch;
resetGitRuntimeAuthoritySnapshotForTest();
await hydratePublishedContentCatalog('zh-CN');
assert.equal(getRuntimeContentStatus().source, 'static-fallback');
assert(fallbackUrls.some(url => url.startsWith('/api/v1/content-bootstrap?')), 'empty Git Product/Care must not suppress Published API bootstrap');

resetRuntimeCompatibilityEvidenceForTest();
await hydrateReviewedCompatibilityEvidence(true);
assert.equal(getRuntimeCompatibilityStatus().source, 'reviewed-git');
assert.match(getRuntimeCompatibilityStatus().authorityVersion, /^tank-compatibility-v3-reviewed-git-[0-9a-f]{8}$/);
assert.equal(getRuntimeCompatibilityStatus().profiles, 7);
assert.equal(getRuntimeCompatibilityStatus().pairRules, 4);
console.log('git runtime authority: non-empty Product/Care + Compatibility preferred; empty Product/Care falls through to Published API PASS');
