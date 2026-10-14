import assert from 'node:assert/strict';

import {
  acquireVerifiedCompatibilitySourcesDetailed,
  buildCompatibilityResearchProviderConfig,
  createBailianCompatibilitySpeciesResearchProvider,
  getCompatibilitySpeciesResearchProviderReadiness,
} from '../apps/api/src/compatibility-species-research-provider';
import { assessCompatibilitySpeciesResearchPacket } from '../src/services/compatibility/species-onboarding-research.service';

const config = {
  ...buildCompatibilityResearchProviderConfig({}),
  apiKey: 'test-key',
  baseUrl: 'https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
  model: 'qwen3.7-flash-2026-07-15',
  timeoutMs: 5_000,
  maxSearchCandidates: 8,
  maxVerifiedSources: 4,
  maxSourceChars: 8_000,
};

assert.deepEqual(getCompatibilitySpeciesResearchProviderReadiness(config), {
  configured: true,
  providerId: 'bailian-web-research-v1',
  host: 'workspace.cn-beijing.maas.aliyuncs.com',
  model: 'qwen3.7-flash-2026-07-15',
  searchMode: 'bailian_web_search',
  sourceVerification: 'server_fetch_required',
});

assert.equal(getCompatibilitySpeciesResearchProviderReadiness({
  ...config,
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
}).configured, true, 'Beijing shared DashScope endpoint must remain a valid Model Studio host');

const dedicatedConfig = buildCompatibilityResearchProviderConfig({
  COMPATIBILITY_RESEARCH_AI_API_KEY: 'dedicated-bailian-key',
  COMPATIBILITY_RESEARCH_AI_BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  COMPATIBILITY_RESEARCH_AI_MODEL: 'qwen-dedicated-research',
  AI_API_KEY: 'generic-deepseek-key',
  AI_BASE_URL: 'https://api.deepseek.com',
  AI_MODEL: 'deepseek-generic',
});
assert.equal(dedicatedConfig.apiKey, 'dedicated-bailian-key');
assert.equal(dedicatedConfig.baseUrl, 'https://dashscope.aliyuncs.com/compatible-mode/v1');
assert.equal(dedicatedConfig.model, 'qwen-dedicated-research');
assert.equal(getCompatibilitySpeciesResearchProviderReadiness(dedicatedConfig).configured, true, 'Compatibility research must be able to use Bailian independently from the app-wide DeepSeek provider');

const scientificName = 'Pseudomugil luminatus';
const sourceUrl = 'https://www.seriouslyfish.com/species/pseudomugil-luminatus';
const html = [
  '<html><head><title>Pseudomugil luminatus – Seriously Fish</title></head><body>',
  '<h1>Pseudomugil luminatus</h1>',
  '<p>Freshwater species. Temperature 24–28 C. pH 6.5–7.5. Maximum adult size 4 cm.</p>',
  '<p>Aquarium base at least 60 cm long and approximately 60 litres.</p>',
  '<p>Keep in a group of at least six. This species is explicitly described here as non-territorial with compatible tankmates.</p>',
  '<p>Community guidance states adults do not treat similarly sized community fishes as prey.</p>',
  '<p>' + 'husbandry '.repeat(80) + '</p>',
  '</body></html>',
].join('');

let searchCalls = 0;
let extractionCalls = 0;
let sourceFetchCalls = 0;

const mockFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));

  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    if (body.enable_search === true) {
      searchCalls += 1;
      const options = body.search_options as Record<string, unknown>;
      assert.equal(options.forced_search, true);
      assert.equal(options.search_strategy, 'max');
      return new Response(JSON.stringify({
        choices: [{
          message: {
            content: JSON.stringify({
              candidates: [
                { url: sourceUrl },
                { url: sourceUrl + '/' },
                { url: 'https://shop.example.com/pseudomugil-luminatus' },
                { url: 'http://127.0.0.1/internal' },
              ],
            }),
          },
        }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    extractionCalls += 1;
    assert.equal(body.enable_search, undefined, 'extraction step must not have web search access');
    const messages = body.messages as Array<{ role: string; content: string }>;
    const user = messages.find(message => message.role === 'user')?.content || '';
    assert.ok(user.includes(sourceUrl));
    assert.ok(user.includes(scientificName));
    assert.match(user, /Do NOT use breeding\/reproduction group sizes/, 'social extraction must reject breeding cohort sizes as husbandry group minima');
    assert.match(user, /Diet statements alone produce no predation claim/, 'predation extraction must reject ordinary diet items as compatibility prey targets');

    return new Response(JSON.stringify({
      choices: [{
        message: {
          content: JSON.stringify({
            debugMetadata: 'must be stripped',
            claims: [
              { field: 'water', proposedValue: 'freshwater', sourceUrl, evidenceKind: 'direct', confidence: 1.0, note: 'Page directly states freshwater.', modelRationale: 'must be stripped' },
              { field: 'temperature', proposedValue: { min: 24, max: 28 }, sourceUrl: sourceUrl + '/', evidenceKind: 'direct', confidence: 'high' },
              { field: 'ph', proposedValue: { min: 6.5, max: 7.5 }, sourceUrl, evidenceKind: 'direct', confidence: 'high' },
              { field: 'adult_size', proposedValue: { min: null, max: 4 }, sourceUrl, evidenceKind: 'direct', confidence: 'high' },
              { field: 'tank_size', proposedValue: { liters: 60, lengthCm: 60 }, sourceUrl, evidenceKind: 'direct', confidence: 'high' },
              { field: 'social_behavior', proposedValue: { mode: 'group', minimumGroupSize: 6 }, sourceUrl, evidenceKind: 'direct', confidence: 'high', note: 'Normal husbandry guidance: keep in a group of at least six.' },
              { field: 'social_behavior', proposedValue: { mode: 'group', minimumGroupSize: 10 }, sourceUrl, evidenceKind: 'direct', confidence: 'medium', note: 'Reproduction: grow up a group of 10 young fish to find a breeding pair.' },
              { field: 'territoriality', proposedValue: { traits: [] }, sourceUrl, evidenceKind: 'direct', confidence: 'medium', note: 'Directly described as non-territorial.' },
              { field: 'predation', proposedValue: { targets: [] }, sourceUrl, evidenceKind: 'direct', confidence: 'medium', note: 'Direct community-fish prey exclusion.' },
              { field: 'predation', proposedValue: { targets: ['zooplankton', 'detritus', 'small fish'] }, sourceUrl, evidenceKind: 'direct', confidence: 'medium', note: 'Feed on zooplankton, detritus and small fish.' },
              { field: 'water', proposedValue: 'freshwater', sourceUrl: 'https://www.fishbase.se/summary/fabricated-never-fetched', evidenceKind: 'direct', confidence: 'high' },
            ],
          }),
        },
      }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }

  if (url.toString() === sourceUrl) {
    sourceFetchCalls += 1;
    assert.equal(init?.redirect, 'manual');
    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  if (url.hostname === 'www.fishbase.se' || url.hostname === 'animaldiversity.org') {
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  }

  throw new Error('unexpected fetch: ' + url);
};

const provider = createBailianCompatibilitySpeciesResearchProvider(config, mockFetch);
const packet = await provider.research({
  catalogKey: 'blind_pseudomugil_luminatus',
  scientificName,
  commonName: 'Red neon blue-eye',
});

assert.equal(searchCalls, 1);
assert.equal(sourceFetchCalls, 1, 'trusted trailing-slash variants must canonicalize before fetch while untrusted candidates are filtered');
assert.equal(extractionCalls, 1);
assert.equal(packet.identityStatus, 'verified');
assert.equal(packet.sources.length, 1);
assert.equal(packet.sources[0].contentVerified, true);
assert.equal(packet.sources[0].reviewStatus, 'draft');
assert.equal(packet.sources[0].sourceType, 'curated_husbandry');
assert.equal(packet.claims.length, 8, 'claim referencing a URL that was never fetched must be discarded');
assert.equal(packet.claims.some(claim => claim.field === 'social_behavior' && (claim.proposedValue as { minimumGroupSize?: number }).minimumGroupSize === 10), false, 'breeding cohort size must be discarded before the review gate');
assert.equal(packet.claims.some(claim => claim.field === 'predation' && (claim.proposedValue as { targets?: string[] }).targets?.includes('zooplankton')), false, 'diet-only prey lists must be discarded before the review gate');
assert.equal(packet.claims.find(claim => claim.field === 'water')?.confidence, 'high', 'numeric model confidence must normalize to the canonical confidence enum');
assert.equal(packet.claims.every(claim => claim.sourceId === packet.sources[0].id), true);

const assessment = assessCompatibilitySpeciesResearchPacket(packet);
assert.equal(assessment.status, 'ready_for_review');
assert.equal(assessment.draftFieldReviews.length, 8);
assert.equal(assessment.candidateProfile?.reviewStatus, 'draft');

let redirectExtractionCalls = 0;
const redirectFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));
  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    if (body.enable_search === true) {
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ candidates: [{ url: sourceUrl }] }) } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    redirectExtractionCalls += 1;
    throw new Error('extraction should not run without verified documents');
  }
  if (url.toString() === sourceUrl) {
    return new Response(null, {
      status: 302,
      headers: { location: 'https://evil.example.net/private-copy' },
    });
  }
  if (url.hostname === 'www.fishbase.se' || url.hostname === 'animaldiversity.org') {
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  }

  throw new Error('unexpected redirected fetch');
};

const redirectedPacket = await createBailianCompatibilitySpeciesResearchProvider(config, redirectFetch).research({
  catalogKey: 'blind_redirect',
  scientificName,
});
assert.equal(redirectExtractionCalls, 0);
assert.deepEqual(redirectedPacket.sources, []);
assert.deepEqual(redirectedPacket.claims, []);
assert.equal(assessCompatibilitySpeciesResearchPacket(redirectedPacket).status, 'research_pending');

const fishBaseTemplateUrl = 'https://www.fishbase.se/summary/Pseudomugil-luminatus.html';
const staleSeriouslyFishUrl = 'https://www.seriouslyfish.com/2019/07/pseudomugil-luminatus-red-neon-blue-eye-rainbowfish/';
const fishBaseHtml = [
  '<html><head><title>Pseudomugil luminatus summary page</title></head><body>',
  '<h1>Pseudomugil luminatus Allen, Unmack & Hadiaty, 2016</h1>',
  '<p>Environment: Freshwater; benthopelagic. Tropical.</p>',
  '<p>Max length: 1.9 cm SL male/unsexed.</p>',
  '<p>' + 'classification distribution morphology reference ecology '.repeat(80) + '</p>',
  '</body></html>',
].join('');

let fallbackExtractionCalls = 0;
const staleSearchFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));
  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    if (body.enable_search === true) {
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ candidates: [
          { url: staleSeriouslyFishUrl },
          { url: 'https://en.wikipedia.org/wiki/Pseudomugil_luminatus' },
        ] }) } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    fallbackExtractionCalls += 1;
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ claims: [
        { field: 'water', proposedValue: 'freshwater', sourceUrl: fishBaseTemplateUrl, evidenceKind: 'direct', confidence: 'high' },
        { field: 'adult_size', proposedValue: { min: null, max: 1.9 }, sourceUrl: fishBaseTemplateUrl, evidenceKind: 'direct', confidence: 'high' },
      ] }) } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (url.toString() === fishBaseTemplateUrl) {
    return new Response(fishBaseHtml, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  if (url.hostname === 'www.seriouslyfish.com' && url.pathname === '/species/pseudomugil-luminatus') {
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  }
  if (url.toString() === staleSeriouslyFishUrl) {
    return new Response(null, { status: 301, headers: { location: '/2019/07/pseudomugil-luminatus-red-neon-blue-eye-rainbowfish' } });
  }
  if (url.hostname === 'www.seriouslyfish.com' && url.pathname === '/2019/07/pseudomugil-luminatus-red-neon-blue-eye-rainbowfish') {
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  }
  if (url.hostname === 'animaldiversity.org') {
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  }
  throw new Error('unexpected fallback fetch: ' + url);
};

const fallbackPacket = await createBailianCompatibilitySpeciesResearchProvider(config, staleSearchFetch).research({
  catalogKey: 'blind_stale_search_result',
  scientificName,
  commonName: 'Red neon blue-eye',
});
assert.equal(fallbackExtractionCalls, 1, 'verified deterministic source should still reach fetched-text extraction');
assert.equal(fallbackPacket.sources.length, 1, 'deterministic trusted candidate should recover from stale model URL');
assert.equal(fallbackPacket.sources[0].url, fishBaseTemplateUrl);
assert.equal(fallbackPacket.sources[0].publisher, 'FishBase');
assert.equal(fallbackPacket.sources[0].contentVerified, true);
assert.deepEqual(fallbackPacket.claims.map(claim => claim.field).sort(), ['adult_size', 'water']);
assert.equal(assessCompatibilitySpeciesResearchPacket(fallbackPacket).status, 'research_pending', 'partial direct evidence must remain fail closed');

const fishipediaTemplateUrl = 'https://www.fishipedia.fr/fr/poissons/pseudomugil-luminatus';
const fishipediaHtml = [
  '<html><head><title>Pseudomugil luminatus • Fiche poissons</title></head><body>',
  '<h1>Pseudomugil luminatus</h1>',
  '<p>Ce poisson vit en eau douce. Taille moyenne 3 cm, taille maximale 4 cm.</p>',
  '<p>Sociabilité: vivant en banc. Territorialité: Non.</p>',
  '<p>Température 24 - 28 °C. pH 4.8 - 7.2.</p>',
  '<p>Maintenance en aquarium: Volume min 60 litres. Population min 10.</p>',
  '<p>' + 'habitat maintenance comportement aquarium source '.repeat(80) + '</p>',
  '</body></html>',
].join('');

let fishipediaExtractionCalls = 0;
const fishipediaFallbackFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));
  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    if (body.enable_search === true) {
      return new Response(JSON.stringify({ error: { message: 'search temporarily unavailable' } }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      });
    }
    fishipediaExtractionCalls += 1;
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ claims: [
        { field: 'water', proposedValue: 'freshwater', sourceUrl: fishipediaTemplateUrl, evidenceKind: 'direct', confidence: 1.0 },
        { field: 'temperature', proposedValue: { min: 24, max: 28 }, sourceUrl: fishipediaTemplateUrl, evidenceKind: 'direct', confidence: 0.98 },
        { field: 'ph', proposedValue: { min: 4.8, max: 7.2 }, sourceUrl: fishipediaTemplateUrl, evidenceKind: 'direct', confidence: 0.96 },
        { field: 'adult_size', proposedValue: { min: 3, max: 4 }, sourceUrl: fishipediaTemplateUrl, evidenceKind: 'direct', confidence: 0.95 },
        { field: 'tank_size', proposedValue: { liters: 60, lengthCm: null }, sourceUrl: fishipediaTemplateUrl, evidenceKind: 'direct', confidence: 0.95 },
        { field: 'social_behavior', proposedValue: { mode: 'group', minimumGroupSize: 10 }, sourceUrl: fishipediaTemplateUrl, evidenceKind: 'direct', confidence: 0.92, note: 'Normal husbandry guidance directly recommends a group of at least 10.' },
        { field: 'territoriality', proposedValue: { traits: [] }, sourceUrl: fishipediaTemplateUrl, evidenceKind: 'direct', confidence: 0.9, note: 'Source directly states Territorialité: Non.' },
      ] }) } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }

  if (url.toString() === fishipediaTemplateUrl) {
    return new Response(fishipediaHtml, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  if (
    url.hostname === 'www.fishbase.se'
    || url.hostname === 'www.fishbase.org'
    || url.hostname === 'www.seriouslyfish.com'
    || url.hostname === 'animaldiversity.org'
  ) {
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  }

  throw new Error('unexpected Fishipedia fallback fetch: ' + url);
};

const fishipediaPacket = await createBailianCompatibilitySpeciesResearchProvider(config, fishipediaFallbackFetch).research({
  catalogKey: 'blind_fishipedia_template',
  scientificName,
  commonName: 'Red neon blue-eye',
});
assert.equal(fishipediaExtractionCalls, 1, 'trusted templates must continue to extraction when supplementary model search fails');
assert.equal(fishipediaPacket.sources.length, 1);
assert.equal(fishipediaPacket.sources[0].url, fishipediaTemplateUrl);
assert.equal(fishipediaPacket.sources[0].publisher, 'Fishipedia');
assert.equal(fishipediaPacket.sources[0].contentVerified, true);
assert.deepEqual(fishipediaPacket.claims.map(claim => claim.field).sort(), [
  'adult_size',
  'ph',
  'social_behavior',
  'tank_size',
  'temperature',
  'territoriality',
  'water',
]);
assert.equal(
  fishipediaPacket.claims.every(claim => ['high', 'medium', 'low', 'unknown'].includes(claim.confidence)),
  true,
  'numeric live-model confidence must normalize before research assessment',
);
assert.equal(
  assessCompatibilitySpeciesResearchPacket(fishipediaPacket).status,
  'research_pending',
  'seven directly supported fields must not synthesize missing predation evidence',
);

let transientExtractionAttempts = 0;
const transientNetworkFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));
  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    if (body.enable_search === true) {
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ candidates: [{ url: sourceUrl }] }) } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    transientExtractionAttempts += 1;
    if (transientExtractionAttempts === 1) {
      const error = new TypeError('fetch failed');
      (error as TypeError & { cause?: Error }).cause = new Error('Client network socket disconnected before secure TLS connection was established');
      throw error;
    }
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ claims: [
        { field: 'water', proposedValue: 'freshwater', sourceUrl, evidenceKind: 'direct', confidence: 'high' },
      ] }) } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (url.toString() === sourceUrl) {
    return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  if (
    url.hostname === 'www.fishbase.se'
    || url.hostname === 'www.fishbase.org'
    || url.hostname === 'www.seriouslyfish.com'
    || url.hostname === 'animaldiversity.org'
    || url.hostname === 'www.fishipedia.fr'
  ) {
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  }
  throw new Error('unexpected transient-network fetch: ' + url);
};
const transientPacket = await createBailianCompatibilitySpeciesResearchProvider(config, transientNetworkFetch).research({
  catalogKey: 'blind_transient_tls_retry',
  scientificName,
});
assert.equal(transientExtractionAttempts, 2, 'one transient provider TLS failure should retry exactly once');
assert.deepEqual(transientPacket.claims.map(claim => claim.field), ['water']);

let persistentExtractionAttempts = 0;
const persistentNetworkFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));
  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    if (body.enable_search === true) {
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ candidates: [{ url: sourceUrl }] }) } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    persistentExtractionAttempts += 1;
    const error = new TypeError('fetch failed');
    (error as TypeError & { cause?: Error }).cause = new Error('Client network socket disconnected before secure TLS connection was established');
    throw error;
  }
  if (url.toString() === sourceUrl) {
    return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  if (
    url.hostname === 'www.fishbase.se'
    || url.hostname === 'www.fishbase.org'
    || url.hostname === 'www.seriouslyfish.com'
    || url.hostname === 'animaldiversity.org'
    || url.hostname === 'www.fishipedia.fr'
  ) {
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  }
  throw new Error('unexpected persistent-network fetch: ' + url);
};
const persistentNetworkPacket = await createBailianCompatibilitySpeciesResearchProvider(config, persistentNetworkFetch).research({
  catalogKey: 'blind_persistent_tls_source_preservation',
  scientificName,
});
assert.equal(persistentExtractionAttempts, 2, 'persistent transient-class transport failure should stop after the bounded retry');
assert.equal(persistentNetworkPacket.sources.length, 1, 'verified source work must survive model transport outage');
assert.equal(persistentNetworkPacket.sources[0].contentVerified, true);
assert.deepEqual(persistentNetworkPacket.claims, [], 'transport outage must never synthesize unsupported claims');
assert.equal(assessCompatibilitySpeciesResearchPacket(persistentNetworkPacket).status, 'research_pending');

const sourceDiagnosticNetworkFetch: typeof fetch = async input => {
  const url = new URL(String(input));
  if (url.hostname === 'www.fishbase.se') {
    const error = new TypeError('fetch failed');
    (error as TypeError & { cause?: Error }).cause = new Error('socket disconnected');
    throw error;
  }
  return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
};
const blockedAcquisition = await acquireVerifiedCompatibilitySourcesDetailed(
  { scientificName },
  config,
  sourceDiagnosticNetworkFetch,
);
assert.deepEqual(blockedAcquisition.sources, []);
assert.ok(blockedAcquisition.diagnostics.some(item => item.status === 'network_error' && item.requestedUrl.includes('fishbase.se')));
assert.ok(blockedAcquisition.diagnostics.some(item => item.status === 'http_error' && item.httpStatus === 404));

const sourceDiagnostic404Fetch: typeof fetch = async () => new Response('not found', {
  status: 404,
  headers: { 'content-type': 'text/html' },
});
const absentAcquisition = await acquireVerifiedCompatibilitySourcesDetailed(
  { scientificName },
  config,
  sourceDiagnostic404Fetch,
);
assert.deepEqual(absentAcquisition.sources, []);
assert.ok(absentAcquisition.diagnostics.length > 0);
assert.ok(absentAcquisition.diagnostics.every(item => item.status === 'http_error' && item.httpStatus === 404));

console.log('Bailian Compatibility research provider PASS: forced web discovery -> trusted URL filter -> server fetch -> exact-taxon content verification -> fetched-text-only extraction; unfetched and unsafe redirects fail closed.');
