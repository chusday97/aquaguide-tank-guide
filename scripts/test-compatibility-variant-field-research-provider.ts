import assert from 'node:assert/strict';

import {
  buildCompatibilityResearchProviderConfig,
  classifyCompatibilityTrustedSourceUrl,
  researchCompatibilityVariantFields,
} from '../apps/api/src/compatibility-species-research-provider';

assert.equal(classifyCompatibilityTrustedSourceUrl('https://www.practicalfishkeeping.co.uk/features/can-the-scales-of-pearlscale-goldfish-be-damaged/')?.sourceType, 'curated_husbandry');
assert.equal(classifyCompatibilityTrustedSourceUrl('https://www.aquariumglaser.de/en/example/')?.sourceType, 'curated_husbandry');

const config = {
  ...buildCompatibilityResearchProviderConfig({}),
  apiKey: 'test-key',
  baseUrl: 'https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
  model: 'qwen3.8-27b',
  fallbackModels: [],
  timeoutMs: 5_000,
  maxSearchCandidates: 8,
  maxVerifiedSources: 4,
  maxSourceChars: 8_000,
};

const variantUrl = 'https://www.seriouslyfish.com/species/carassius-auratus';
const genericUrl = 'https://www.fishbase.se/summary/Carassius-auratus.html';
const variantHtml = [
  '<html><head><title>Pearlscale Carassius auratus husbandry</title></head><body>',
  '<h1>Pearlscale goldfish - Carassius auratus</h1>',
  '<p>Pearlscale goldfish are maintained at 18-24 C in routine aquarium husbandry.</p>',
  '<p>Adults of this Pearlscale variety reach about 15 cm in aquaria.</p>',
  '<p>Pearlscale goldfish should be kept in an aquarium of at least 100 litres.</p>',
  '<p>' + 'Pearlscale Carassius auratus husbandry '.repeat(50) + '</p>',
  '</body></html>',
].join('');
const genericHtml = [
  '<html><head><title>Carassius auratus generic profile</title></head><body>',
  '<h1>Carassius auratus</h1>',
  '<p>Temperature 10-25 C. pH 6.5-8.0.</p>',
  '<p>' + 'generic goldfish husbandry '.repeat(60) + '</p>',
  '</body></html>',
].join('');

let searchCalls = 0;
let extractionCalls = 0;
const mockFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));
  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    const messages = body.messages as Array<{ role: string; content: string }>;
    const user = messages.find(message => message.role === 'user')?.content || '';
    if (body.enable_search === true) {
      searchCalls += 1;
      assert.match(user, /Exact variant label: Pearlscale/);
      assert.match(user, /Base scientific taxon: Carassius auratus/);
      assert.match(user, /Target fields only: temperature, adult_size, tank_size/);
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({
          candidates: [{ url: variantUrl }, { url: genericUrl }],
        }) } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    extractionCalls += 1;
    assert.match(user, /Generic base-species facts do not qualify/);
    assert.ok(user.includes(variantUrl));
    assert.equal(user.includes(genericUrl), false, 'generic base-taxonomy document must be removed before exact-variant extraction');
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        claims: [
          {
            field: 'temperature',
            proposedValue: { min: 18, max: 24 },
            sourceUrl: variantUrl,
            evidenceKind: 'direct',
            confidence: 'high',
            evidenceText: 'Pearlscale goldfish are maintained at 18-24 C in routine aquarium husbandry.',
            note: 'Routine Pearlscale husbandry range.',
          },
          {
            field: 'adult_size',
            proposedValue: { min: null, max: 15 },
            sourceUrl: variantUrl,
            evidenceKind: 'direct',
            confidence: 'high',
            evidenceText: 'Adults of this Pearlscale variety reach about 15 cm in aquaria.',
            note: 'Exact variety adult size.',
          },
          {
            field: 'tank_size',
            proposedValue: { liters: 100, lengthCm: null },
            sourceUrl: variantUrl,
            evidenceKind: 'direct',
            confidence: 'medium',
            evidenceText: 'Pearlscale goldfish should be kept in an aquarium of at least 100 litres.',
            note: 'Exact variety minimum aquarium volume.',
          },
          {
            field: 'ph',
            proposedValue: { min: 6.5, max: 8 },
            sourceUrl: variantUrl,
            evidenceKind: 'direct',
            confidence: 'high',
            evidenceText: 'This quote does not exist in the fetched document.',
          },
        ],
      }) } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }

  if (url.toString() === variantUrl) {
    return new Response(variantHtml, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  if (url.toString() === genericUrl) {
    return new Response(genericHtml, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  throw new Error('unexpected fetch: ' + url);
};

const result = await researchCompatibilityVariantFields({
  speciesId: 'sp_0067',
  baseScientificName: 'Carassius auratus',
  variantKey: 'Pearlscale',
  commonName: 'Pearlscale goldfish',
  targetFields: ['temperature', 'adult_size', 'tank_size'],
  round: 1,
}, config, mockFetch);

assert.equal(searchCalls, 2, 'exact-variant research must search both institutional and academic routes');
assert.equal(extractionCalls, 1, 'eligible exact-variant documents should be extracted together');
assert.equal(result.sources.length, 1, 'generic base-species source must not survive exact-variant document gate');
assert.equal(result.sources[0].url, variantUrl);
assert.equal(result.discoveryStatus, 'verified_variant_documents');
assert.equal(result.discoveredUrlCount, 2);
assert.equal(result.verifiedVariantDocumentCount, 1);
assert.deepEqual(result.fieldCandidates.map(item => item.field).sort(), ['adult_size', 'tank_size', 'temperature']);
assert.deepEqual(result.unresolvedFields, []);
assert.equal(result.promotionAllowed, false);
assert.equal(result.writesAuthority, false);
assert.ok(result.fieldCandidates.every(candidate => candidate.evidenceText.length > 8));

console.log('Compatibility exact-variant field research provider PASS: generic base pages are rejected; only quote-backed exact-variant field candidates survive.');
