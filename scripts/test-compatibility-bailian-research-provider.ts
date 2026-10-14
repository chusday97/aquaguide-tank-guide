import assert from 'node:assert/strict';

import {
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

    return new Response(JSON.stringify({
      choices: [{
        message: {
          content: JSON.stringify({
            debugMetadata: 'must be stripped',
            claims: [
              { field: 'water', proposedValue: 'freshwater', sourceUrl, evidenceKind: 'direct', confidence: 1.0, note: 'Page directly states freshwater.', modelRationale: 'must be stripped' },
              { field: 'temperature', proposedValue: { min: 24, max: 28 }, sourceUrl, evidenceKind: 'direct', confidence: 'high' },
              { field: 'ph', proposedValue: { min: 6.5, max: 7.5 }, sourceUrl, evidenceKind: 'direct', confidence: 'high' },
              { field: 'adult_size', proposedValue: { min: null, max: 4 }, sourceUrl, evidenceKind: 'direct', confidence: 'high' },
              { field: 'tank_size', proposedValue: { liters: 60, lengthCm: 60 }, sourceUrl, evidenceKind: 'direct', confidence: 'high' },
              { field: 'social_behavior', proposedValue: { mode: 'group', minimumGroupSize: 6 }, sourceUrl, evidenceKind: 'direct', confidence: 'high' },
              { field: 'territoriality', proposedValue: { traits: [] }, sourceUrl, evidenceKind: 'direct', confidence: 'medium', note: 'Directly described as non-territorial.' },
              { field: 'predation', proposedValue: { targets: [] }, sourceUrl, evidenceKind: 'direct', confidence: 'medium', note: 'Direct community-fish prey exclusion.' },
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
assert.equal(sourceFetchCalls, 1, 'untrusted candidate domains must be filtered before fetch');
assert.equal(extractionCalls, 1);
assert.equal(packet.identityStatus, 'verified');
assert.equal(packet.sources.length, 1);
assert.equal(packet.sources[0].contentVerified, true);
assert.equal(packet.sources[0].reviewStatus, 'draft');
assert.equal(packet.sources[0].sourceType, 'curated_husbandry');
assert.equal(packet.claims.length, 8, 'claim referencing a URL that was never fetched must be discarded');
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
        { field: 'social_behavior', proposedValue: { mode: 'group', minimumGroupSize: 10 }, sourceUrl: fishipediaTemplateUrl, evidenceKind: 'direct', confidence: 0.92 },
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

console.log('Bailian Compatibility research provider PASS: forced web discovery -> trusted URL filter -> server fetch -> exact-taxon content verification -> fetched-text-only extraction; unfetched and unsafe redirects fail closed.');
