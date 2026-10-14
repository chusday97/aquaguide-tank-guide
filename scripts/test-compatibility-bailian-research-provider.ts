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
            claims: [
              { field: 'water', proposedValue: 'freshwater', sourceUrl, evidenceKind: 'direct', confidence: 'high', note: 'Page directly states freshwater.' },
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

console.log('Bailian Compatibility research provider PASS: forced web discovery -> trusted URL filter -> server fetch -> exact-taxon content verification -> fetched-text-only extraction; unfetched and unsafe redirects fail closed.');
