import assert from 'node:assert/strict';

import {
  acquireVerifiedCompatibilitySourcesDetailed,
  buildCompatibilityResearchProviderConfig,
  buildCompatibilityResearchModelPool,
  createBailianCompatibilitySpeciesResearchProvider,
  getCompatibilitySpeciesResearchProviderReadiness,
  probeCompatibilityResearchProvider,
  probeCompatibilityResearchSearchProvider,
} from '../apps/api/src/compatibility-species-research-provider';
import { assessCompatibilitySpeciesResearchPacket } from '../src/services/compatibility/species-onboarding-research.service';

const config = {
  ...buildCompatibilityResearchProviderConfig({}),
  apiKey: 'test-key',
  baseUrl: 'https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
  model: 'qwen3.7-flash-2026-07-15',
  timeoutMs: 5_000,
  searchTimeoutMs: 15_000,
  maxSearchCandidates: 8,
  maxVerifiedSources: 4,
  maxSourceChars: 8_000,
};

assert.deepEqual(getCompatibilitySpeciesResearchProviderReadiness(config), {
  configured: true,
  providerId: 'bailian-web-research-v1',
  host: 'workspace.cn-beijing.maas.aliyuncs.com',
  model: 'qwen3.7-flash-2026-07-15',
  fallbackModels: [],
  searchMode: 'bailian_web_search',
  sourceVerification: 'server_fetch_required',
  searchStrategy: 'turbo',
  searchTimeoutMs: 15_000,
});

assert.equal(getCompatibilitySpeciesResearchProviderReadiness({
  ...config,
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
}).configured, true, 'Beijing shared DashScope endpoint must remain a valid Model Studio host');

const dedicatedConfig = buildCompatibilityResearchProviderConfig({
  COMPATIBILITY_RESEARCH_AI_API_KEY: 'dedicated-bailian-key',
  COMPATIBILITY_RESEARCH_AI_BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  COMPATIBILITY_RESEARCH_AI_MODEL: 'qwen-dedicated-research',
  COMPATIBILITY_RESEARCH_AI_FALLBACK_MODELS: 'qwen3.8-27b,deepseek-v4.1-flash,qwen3.8-27b',
  AI_API_KEY: 'generic-deepseek-key',
  AI_BASE_URL: 'https://api.deepseek.com',
  AI_MODEL: 'deepseek-generic',
});
assert.equal(dedicatedConfig.apiKey, 'dedicated-bailian-key');
assert.equal(dedicatedConfig.baseUrl, 'https://dashscope.aliyuncs.com/compatible-mode/v1');
assert.equal(dedicatedConfig.model, 'qwen-dedicated-research');
assert.deepEqual(dedicatedConfig.fallbackModels, ['qwen3.8-27b', 'deepseek-v4.1-flash']);
assert.equal(dedicatedConfig.searchStrategy, 'turbo');
assert.equal(dedicatedConfig.searchTimeoutMs, 20_000);
const maxSearchConfig = buildCompatibilityResearchProviderConfig({
  COMPATIBILITY_RESEARCH_SEARCH_STRATEGY: 'max',
  COMPATIBILITY_RESEARCH_SEARCH_TIMEOUT_MS: '30000',
});
assert.equal(maxSearchConfig.searchStrategy, 'max');
assert.equal(maxSearchConfig.searchTimeoutMs, 30_000);
assert.deepEqual(buildCompatibilityResearchModelPool('qwen3.7-flash-2026-07-15', ['qwen3.8-27b', 'deepseek-v4.1-flash', 'qwen3.8-27b']), ['qwen3.7-flash-2026-07-15', 'qwen3.8-27b', 'deepseek-v4.1-flash']);
assert.equal(getCompatibilitySpeciesResearchProviderReadiness(dedicatedConfig).configured, true, 'Compatibility research must be able to use Bailian independently from the app-wide DeepSeek provider');

const fallbackModelsSeen: string[] = [];
const quotaFallbackPreflight = await probeCompatibilityResearchProvider({
  ...config,
  model: 'qwen3.7-flash-2026-07-15',
  fallbackModels: ['qwen3.8-27b'],
}, async (_input, init) => {
  const body = JSON.parse(String(init?.body || '{}')) as { model?: string };
  fallbackModelsSeen.push(body.model || '');
  if (body.model === 'qwen3.7-flash-2026-07-15') {
    return new Response(JSON.stringify({ error: { code: 'free_tier_quota_exhausted' } }), {
      status: 429,
      headers: { 'content-type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({
    choices: [{ message: { content: '{"ok":true}' } }],
  }), { status: 200, headers: { 'content-type': 'application/json' } });
});
assert.equal(quotaFallbackPreflight.status, 'ready');
assert.equal(quotaFallbackPreflight.model, 'qwen3.8-27b');
assert.deepEqual(fallbackModelsSeen, ['qwen3.7-flash-2026-07-15', 'qwen3.8-27b']);

let credentialCalls = 0;
const credentialFailure = await probeCompatibilityResearchProvider({
  ...config,
  fallbackModels: ['qwen3.8-27b'],
}, async () => {
  credentialCalls += 1;
  return new Response(JSON.stringify({ error: { code: 'invalid_api_key' } }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });
});
assert.equal(credentialFailure.status, 'credential_rejected');
assert.equal(credentialCalls, 1, 'invalid credentials must not waste requests across the free-model pool');

let searchPreflightCalls = 0;
const searchPreflight = await probeCompatibilityResearchSearchProvider(config, async (_input, init) => {
  searchPreflightCalls += 1;
  const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
  if (body.enable_search === true) {
    const options = body.search_options as Record<string, unknown>;
    assert.equal(options.forced_search, true);
    assert.equal(options.search_strategy, 'turbo');
    return new Response(JSON.stringify({
      choices: [{ message: { content: '{"candidates":[{"url":"https://fishbase.se"}]}' } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return new Response(JSON.stringify({
    choices: [{ message: { content: '{"ok":true}' } }],
  }), { status: 200, headers: { 'content-type': 'application/json' } });
});
assert.equal(searchPreflight.status, 'ready');
assert.equal(searchPreflight.phase, 'web_search');
assert.equal(searchPreflightCalls, 2, 'web-search preflight must verify base model first, then forced search');

let failedSearchPreflightCalls = 0;
const searchTransportFailure = await probeCompatibilityResearchSearchProvider(config, async (_input, init) => {
  failedSearchPreflightCalls += 1;
  const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
  if (body.enable_search === true) {
    const error = new TypeError('fetch failed');
    (error as TypeError & { cause?: Error }).cause = new Error('Client network socket disconnected before secure TLS connection was established');
    throw error;
  }
  return new Response(JSON.stringify({
    choices: [{ message: { content: '{"ok":true}' } }],
  }), { status: 200, headers: { 'content-type': 'application/json' } });
});
assert.equal(searchTransportFailure.status, 'transport_unavailable');
assert.equal(searchTransportFailure.phase, 'web_search');
assert.equal(searchTransportFailure.reasonCode, 'web_search_network');
assert.equal(failedSearchPreflightCalls, 2);


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
let targetedSearchPrompts = 0;
let targetedExtractionPrompts = 0;

const mockFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));

  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    if (body.enable_search === true) {
      searchCalls += 1;
      const options = body.search_options as Record<string, unknown>;
      assert.equal(options.forced_search, true);
      assert.equal(options.search_strategy, 'turbo');
      const messages = body.messages as Array<{ role: string; content: string }>;
      const user = messages.find(message => message.role === 'user')?.content || '';
      if (user.includes('Target evidence fields:')) {
        targetedSearchPrompts += 1;
        assert.match(user, /Target evidence fields: territoriality, predation/);
        assert.match(user, /territoriality: aquarium territoriality, aggression/);
        assert.match(user, /predation: tankmate prey risk/);
      }
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
    if (user.includes('targeted gap-closing pass')) {
      targetedExtractionPrompts += 1;
      assert.match(user, /Return claims ONLY for: territoriality, predation/);
    }

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
              { field: 'predation', proposedValue: { targets: [] }, sourceUrl, evidenceKind: 'direct', confidence: 'medium', note: 'Community guidance states adults do not treat similarly sized community fishes as prey.' },
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

const targetedPacket = await provider.research({
  catalogKey: 'blind_pseudomugil_luminatus',
  scientificName,
  commonName: 'Red neon blue-eye',
  targetFields: ['territoriality', 'predation'],
});
assert.equal(targetedSearchPrompts, 1, 'targeted second pass must tell web search exactly which evidence gaps to close');
assert.equal(targetedExtractionPrompts, 1, 'targeted second pass must restrict extraction to requested fields');
assert.deepEqual(
  [...new Set(targetedPacket.claims.map(claim => claim.field))].sort(),
  ['predation', 'territoriality'],
  'non-target claims returned by the model must be discarded deterministically',
);


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
  '<p>' + 'cookie navigation classification distribution '.repeat(500) + '</p>',
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
assert.match(
  fallbackPacket.sources[0].title,
  /Pseudomugil luminatus/i,
);
assert.equal(
  fallbackPacket.sources[0].url,
  fishBaseTemplateUrl,
  'long FishBase pages must retain the exact-taxon window while excerpting distant evidence anchors',
);
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
        { field: 'territoriality', proposedValue: { traits: [] }, sourceUrl: fishipediaTemplateUrl, evidenceKind: 'direct', confidence: 0.9, note: "Source directly states the species is non-territorial ('Territorialité: Non')." },
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
assert.deepEqual(Object.fromEntries(transientPacket.claims.map(claim => [claim.field, claim.proposedValue])), {
  temperature: { min: 24, max: 28 },
  ph: { min: 6.5, max: 7.5 },
  water: 'freshwater',
}, 'verified deterministic Quick facts must survive the transient model retry while the successful model result may add its sourced water claim');
assert.equal(transientPacket.diagnostics?.extractionStatus, 'ok');

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
assert.equal(persistentExtractionAttempts, 3, 'persistent transient-class extraction transport failure should stop after three bounded attempts');
assert.equal(persistentNetworkPacket.sources.length, 1, 'verified source work must survive model transport outage');
assert.equal(persistentNetworkPacket.sources[0].contentVerified, true);
assert.deepEqual(Object.fromEntries(persistentNetworkPacket.claims.map(claim => [claim.field, claim.proposedValue])), {
  temperature: { min: 24, max: 28 },
  ph: { min: 6.5, max: 7.5 },
}, 'persistent model transport outage must preserve only deterministic explicit claims from the verified source and synthesize nothing else');
assert.equal(persistentNetworkPacket.diagnostics?.extractionStatus, 'transport_unavailable');
assert.equal(persistentNetworkPacket.diagnostics?.transportErrorCode, 'retryable_network_error');
assert.equal(persistentNetworkPacket.diagnostics?.verifiedSourceCount, 1);
const persistentAssessment = assessCompatibilitySpeciesResearchPacket(persistentNetworkPacket);
assert.equal(persistentAssessment.status, 'research_pending');
assert.ok(persistentAssessment.reasonCodes.includes('provider_extraction_transport_unavailable'));

let deterministicFishBaseExtractionAttempts = 0;
const deterministicFishBaseOutageFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));
  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    if (body.enable_search === true) {
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ candidates: [{ url: fishBaseTemplateUrl }] }) } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    deterministicFishBaseExtractionAttempts += 1;
    const error = new TypeError('fetch failed');
    (error as TypeError & { cause?: Error }).cause = new Error('Client network socket disconnected before secure TLS connection was established');
    throw error;
  }
  if (url.toString() === fishBaseTemplateUrl) {
    return new Response(fishBaseHtml, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  if (
    url.hostname === 'www.fishbase.se'
    || url.hostname === 'www.fishbase.org'
    || url.hostname === 'www.seriouslyfish.com'
    || url.hostname === 'animaldiversity.org'
    || url.hostname === 'www.fishipedia.fr'
  ) return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  throw new Error('unexpected deterministic FishBase outage fetch: ' + url);
};
const deterministicFishBasePacket = await createBailianCompatibilitySpeciesResearchProvider(config, deterministicFishBaseOutageFetch).research({
  catalogKey: 'deterministic_fishbase_transport_fallback',
  scientificName,
  targetFields: ['water', 'adult_size', 'predation'],
});
assert.equal(deterministicFishBaseExtractionAttempts, 3, 'AI extraction still gets its bounded retry budget before deterministic fallback is used');
assert.deepEqual(
  deterministicFishBasePacket.claims.map(claim => claim.field).sort(),
  ['adult_size', 'water'],
  'verified FishBase labels may deterministically preserve only explicit environment/size facts during AI transport failure',
);
assert.equal(deterministicFishBasePacket.claims.some(claim => claim.field === 'predation'), false, 'deterministic fallback must never infer predation from FishBase diet/ecology text');
assert.equal(deterministicFishBasePacket.diagnostics?.extractionStatus, 'transport_unavailable');
const deterministicFishBaseAssessment = assessCompatibilitySpeciesResearchPacket(deterministicFishBasePacket);
assert.equal(deterministicFishBaseAssessment.fieldResolutions.find(item => item.field === 'water')?.status, 'supported');
assert.equal(deterministicFishBaseAssessment.fieldResolutions.find(item => item.field === 'adult_size')?.status, 'supported');

let deterministicFishipediaExtractionAttempts = 0;
const deterministicFishipediaOutageFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));
  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    if (body.enable_search === true) {
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ candidates: [{ url: fishipediaTemplateUrl }] }) } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    deterministicFishipediaExtractionAttempts += 1;
    const error = new TypeError('fetch failed');
    (error as TypeError & { cause?: Error }).cause = new Error('Client network socket disconnected before secure TLS connection was established');
    throw error;
  }
  if (url.toString() === fishipediaTemplateUrl) {
    const longLeadingNavigation = '<p>' + 'Navigation filler without husbandry evidence. '.repeat(1800) + '</p>';
    return new Response(fishipediaHtml.replace('<body>', '<body>' + longLeadingNavigation), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  if (
    url.hostname === 'www.fishbase.se'
    || url.hostname === 'www.fishbase.org'
    || url.hostname === 'www.seriouslyfish.com'
    || url.hostname === 'animaldiversity.org'
  ) return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  throw new Error('unexpected deterministic Fishipedia outage fetch: ' + url);
};
const deterministicFishipediaPacket = await createBailianCompatibilitySpeciesResearchProvider(config, deterministicFishipediaOutageFetch).research({
  catalogKey: 'deterministic_fishipedia_transport_fallback',
  scientificName,
  targetFields: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior'],
});
assert.equal(deterministicFishipediaExtractionAttempts, 3);
assert.deepEqual(
  deterministicFishipediaPacket.claims.map(claim => claim.field).sort(),
  ['adult_size', 'ph', 'tank_size', 'temperature', 'water'],
  'verified Fishipedia explicit labels may close numeric/environment fields without widening into social inference',
);
assert.equal(deterministicFishipediaPacket.claims.some(claim => claim.field === 'social_behavior'), false);

const planetCatfishUrl = 'https://www.planetcatfish.com/cotm/cotm.php?article_id=999';
const planetCatfishForumUrl = 'https://www.planetcatfish.com/forum/viewtopic.php?t=999';
const planetCatfishLegacyUrl = 'https://www.planetcatfish.com/catelog/species.php?species_id=107';
let planetCatfishPageFetches = 0;
let planetCatfishForumFetches = 0;
const planetCatfishFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));
  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    if (body.enable_search === true) {
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ candidates: [
          { url: planetCatfishUrl },
          { url: planetCatfishLegacyUrl },
          { url: planetCatfishForumUrl },
        ] }) } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ claims: [
        {
          field: 'social_behavior',
          proposedValue: { mode: 'group', minimumGroupSize: 6 },
          sourceUrl: planetCatfishUrl,
          evidenceKind: 'direct',
          confidence: 'high',
          note: 'Compatibility section directly recommends keeping this exact species in a group of at least six.',
        },
      ] }) } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (url.toString() === planetCatfishUrl || url.toString() === planetCatfishLegacyUrl) {
    planetCatfishPageFetches += 1;
    return new Response([
      '<html><head><title>Pseudomugil luminatus specialist species profile</title></head><body>',
      '<h1>Pseudomugil luminatus</h1>',
      '<p>Compatibility: keep Pseudomugil luminatus in a group of at least six.</p>',
      '<p>User data. ' + 'specialist husbandry '.repeat(70) + '</p>',
      '</body></html>',
    ].join(''), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  if (url.toString() === planetCatfishForumUrl) {
    planetCatfishForumFetches += 1;
    throw new Error('PlanetCatfish forum URL must be rejected before fetch');
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
  throw new Error('unexpected PlanetCatfish policy fetch: ' + url);
};
const planetCatfishPacket = await createBailianCompatibilitySpeciesResearchProvider(config, planetCatfishFetch).research({
  catalogKey: 'blind_planetcatfish_specialist_candidate',
  scientificName,
  targetFields: ['social_behavior'],
});
assert.equal(planetCatfishPageFetches, 2, 'new and legacy PlanetCatfish exact-taxon specialist page URLs may enter verified-source acquisition');
assert.equal(planetCatfishForumFetches, 0, 'PlanetCatfish forums must be rejected before server fetch');
assert.equal(planetCatfishPacket.sources.length, 2);
assert.equal(planetCatfishPacket.sources.every(source => source.publisher === 'PlanetCatfish'), true);
assert.equal(planetCatfishPacket.sources.every(source => source.sourceType === 'curated_husbandry'), true);
assert.deepEqual(
  planetCatfishPacket.sources.map(source => source.url).sort(),
  [planetCatfishLegacyUrl, planetCatfishUrl].sort(),
  'new and legacy exact-taxon page forms must both survive source verification',
);
assert.equal(planetCatfishPacket.claims.length, 1);
assert.equal(planetCatfishPacket.claims[0].confidence, 'medium', 'specialist PlanetCatfish evidence is candidate-only and must never retain high model confidence');

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
