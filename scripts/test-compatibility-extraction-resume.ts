import assert from 'node:assert/strict';
import {
  buildCompatibilityResearchProviderConfig,
  probeCompatibilityResearchProvider,
  researchCompatibilitySpeciesWithResume,
  retryCompatibilityExtractionFromResume,
} from '../apps/api/src/compatibility-species-research-provider';

const config = {
  ...buildCompatibilityResearchProviderConfig({}),
  apiKey: 'test-key',
  baseUrl: 'https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
  model: 'qwen-test',
  timeoutMs: 3_000,
  maxSearchCandidates: 8,
  maxVerifiedSources: 4,
  maxSourceChars: 8_000,
};
const scientificName = 'Pseudomugil luminatus';
const sourceUrl = 'https://www.seriouslyfish.com/species/pseudomugil-luminatus';
const sourceHtml = [
  '<html><head><title>Pseudomugil luminatus · Seriously Fish</title></head><body>',
  '<h1>Pseudomugil luminatus</h1>',
  '<p>In the aquarium this species is not predatory toward small fish tankmates.</p>',
  '<p>' + 'Verified exact-taxon husbandry context. '.repeat(80) + '</p>',
  '</body></html>',
].join('');

let sourceOnlyProviderCalls = 0;
const sourceOnlyFetch: typeof fetch = async input => {
  const url = new URL(String(input));
  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    sourceOnlyProviderCalls += 1;
    throw new Error('source-only mode must not call model endpoint');
  }
  if (url.toString() === sourceUrl) {
    return new Response(sourceHtml, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
};
const sourceOnly = await researchCompatibilitySpeciesWithResume({
  catalogKey: 'sp_resume_fixture',
  commonName: 'Red neon blue-eye',
  scientificName,
  targetFields: ['predation'],
}, {
  config,
  fetchImpl: sourceOnlyFetch,
  skipAiExtraction: true,
  skipModelDiscovery: true,
});
assert.equal(sourceOnlyProviderCalls, 0);
assert.equal(sourceOnly.packet.diagnostics?.extractionStatus, 'transport_unavailable');
assert.equal(sourceOnly.resumeBundle.documents.length, 1);
assert.equal(sourceOnly.resumeBundle.documents[0].url, sourceUrl);
assert.match(sourceOnly.resumeBundle.documents[0].contentSha256, /^[a-f0-9]{64}$/);
assert.deepEqual(sourceOnly.resumeBundle.targetFields, ['predation']);

let retryProviderCalls = 0;
let retrySourceCalls = 0;
const retryFetch: typeof fetch = async input => {
  const url = new URL(String(input));
  if (url.hostname !== 'workspace.cn-beijing.maas.aliyuncs.com') {
    retrySourceCalls += 1;
    throw new Error('resume retry must not refetch sources');
  }
  retryProviderCalls += 1;
  return new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify({ claims: [{
      field: 'predation',
      proposedValue: { targets: [] },
      sourceUrl,
      evidenceKind: 'direct',
      confidence: 'high',
      note: 'The aquarium husbandry page directly states this species is not predatory toward small fish tankmates.',
    }] }) } }],
  }), { status: 200, headers: { 'content-type': 'application/json' } });
};
const retried = await retryCompatibilityExtractionFromResume(sourceOnly.resumeBundle, config, retryFetch);
assert.equal(retryProviderCalls, 1);
assert.equal(retrySourceCalls, 0);
assert.equal(retried.sources.length, 1);
assert.deepEqual(retried.claims.map(claim => claim.field), ['predation']);
assert.deepEqual(retried.claims[0].proposedValue, { targets: [] });
assert.equal(retried.diagnostics?.extractionStatus, 'ok');

let tamperedProviderCalls = 0;
const tampered = structuredClone(sourceOnly.resumeBundle);
tampered.documents[0].text += ' tampered';
await assert.rejects(
  () => retryCompatibilityExtractionFromResume(tampered, config, async () => {
    tamperedProviderCalls += 1;
    return new Response('{}');
  }),
  /compatibility_research_resume_bundle_invalid/,
);
assert.equal(tamperedProviderCalls, 0, 'tampered resume data must fail before provider invocation');

const ready = await probeCompatibilityResearchProvider(config, async () => new Response(JSON.stringify({
  choices: [{ message: { content: '{"ok":true}' } }],
}), { status: 200, headers: { 'content-type': 'application/json' } }));
assert.equal(ready.status, 'ready');
const rejected = await probeCompatibilityResearchProvider(config, async () => new Response('{}', { status: 401 }));
assert.equal(rejected.status, 'credential_rejected');
const transport = await probeCompatibilityResearchProvider(config, async () => {
  const error = new TypeError('fetch failed');
  (error as TypeError & { cause?: Error }).cause = new Error('Client network socket disconnected before secure TLS connection was established');
  throw error;
});
assert.equal(transport.status, 'transport_unavailable');
const notConfigured = await probeCompatibilityResearchProvider(buildCompatibilityResearchProviderConfig({}), async () => {
  throw new Error('not configured preflight must not fetch');
});
assert.equal(notConfigured.status, 'not_configured');

console.log('Compatibility extraction resume PASS: source-only capture avoids model calls, resume retry avoids GBIF/source refetch, tampering fails before extraction, and preflight distinguishes ready/transport/credential/config states.');
