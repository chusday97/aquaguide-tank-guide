import assert from 'node:assert/strict';
import { buildLocalCatalogSnapshot, loadCatalogSnapshot } from '../src/services/catalog/catalog-snapshot.service';

const local = await buildLocalCatalogSnapshot();
assert.equal(local.manifest.speciesCount, local.species.length);
assert.equal(local.manifest.reviewedProfileCount, local.compatibilityProfiles.filter(item => item.reviewStatus === 'reviewed').length);
assert.equal(local.manifest.reviewedPairRuleCount, local.pairRules.filter(item => item.reviewStatus === 'reviewed').length);
assert.match(local.manifest.checksumSha256, /^[a-f0-9]{64}$/);
assert.ok(local.species.length >= 400, 'bundled catalog must include the current species set');
assert.ok(local.species.every(item => item.waterType === 'unknown'), 'legacy adapter must not infer water type from text');

const fetchRemote = async (url: string | URL | Request) => new Response(
  String(url).includes('/current') ? JSON.stringify(local.manifest) : JSON.stringify(local),
  { status: 200, headers: { 'content-type': 'application/json' } },
);
const remote = await loadCatalogSnapshot({ fetchImpl: fetchRemote });
assert.equal(remote.source, 'remote');
assert.equal(remote.snapshot.manifest.checksumSha256, local.manifest.checksumSha256);

const fetchBroken = async () => new Response('{"version":"broken"}', { status: 200 });
const fallback = await loadCatalogSnapshot({ fetchImpl: fetchBroken });
assert.equal(fallback.source, 'local');
assert.equal(fallback.fallbackReason, 'manifest_invalid');

console.log(`catalog snapshot verified: ${local.species.length} species, ${local.evidenceSources.length} evidence sources, checksum ${local.manifest.checksumSha256}`);
