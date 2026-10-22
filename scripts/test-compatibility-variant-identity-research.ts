import assert from 'node:assert/strict';
import {
  researchCompatibilityVariantIdentities,
  type CompatibilityResearchProviderConfig,
} from '../apps/api/src/compatibility-species-research-provider';

const config: CompatibilityResearchProviderConfig = {
  apiKey: 'test-key',
  baseUrl: 'https://test.cn-beijing.maas.aliyuncs.com',
  model: 'qwen3.7-flash-2026-07-15',
  fallbackModels: [],
  timeoutMs: 5_000,
  searchTimeoutMs: 15_000,
  searchStrategy: 'turbo',
  maxSearchCandidates: 6,
  maxVerifiedSources: 4,
  maxSourceChars: 8_000,
};

let modelCalls = 0;
const trustedPage = `
<html><head><title>Betta splendens ornamental phenotypes</title></head><body>
<h1>Betta splendens</h1>
<p>Koi is an ornamental color variety of domesticated Betta splendens.</p>
<p>Halfmoon is another domesticated Betta splendens fin-form variety.</p>
<p>This institutional species account discusses domesticated ornamental Betta splendens, selective breeding, named phenotypes, aquarium strains, and the distinction between commercial varieties and separate biological species. The surrounding explanatory material is intentionally long enough to exercise the same minimum verified-document threshold used by production source fetching. Koi and Halfmoon are discussed as examples of named ornamental forms within domesticated Betta splendens rather than separate accepted taxa.</p>
</body></html>`;

const result = await researchCompatibilityVariantIdentities({
  baseScientificName: 'Betta splendens',
  variants: [
    { speciesId: 'sp_koi', scientificName: 'Betta splendens var. Koi', commonName: 'Koi Betta' },
    { speciesId: 'sp_blue', scientificName: 'Betta splendens var. Blue', commonName: 'Blue Betta' },
  ],
}, config, async (input, init) => {
  const url = String(input);
  if (url.endsWith('/chat/completions')) {
    modelCalls += 1;
    const body = JSON.parse(String(init?.body || '{}')) as { enable_search?: boolean };
    const content = body.enable_search
      ? JSON.stringify({ candidates: [{ url: modelCalls === 1 ? 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3041685' : 'https://animaldiversity.org/accounts/Betta_splendens/' }] })
      : JSON.stringify({
        claims: [
          {
            speciesId: 'sp_koi',
            variantScientificName: 'Betta splendens var. Koi',
            sourceUrl: 'https://animaldiversity.org/accounts/Betta_splendens/',
            relationship: 'same_species_variant',
            confidence: 'high',
            evidenceText: 'Koi is an ornamental color variety of domesticated Betta splendens.',
            note: 'Direct named variety relationship.',
          },
          {
            speciesId: 'sp_blue',
            variantScientificName: 'Betta splendens var. Blue',
            sourceUrl: 'https://animaldiversity.org/accounts/Betta_splendens/',
            relationship: 'same_species_variant',
            confidence: 'high',
            evidenceText: 'Betta splendens',
            note: 'This must be rejected because the variant label is absent.',
          },
        ],
      });
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (url === 'https://animaldiversity.org/accounts/Betta_splendens' || url === 'https://animaldiversity.org/accounts/Betta_splendens/') {
        return new Response(trustedPage, {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
  }
  return new Response('not found', { status: 404 });
});

assert.equal(modelCalls, 3, 'two specialized grouped discovery routes plus one grouped identity extraction call');
assert.equal(result.candidates.length, 1);
assert.equal(result.candidates[0]?.speciesId, 'sp_koi');
assert.deepEqual(result.unresolvedSpeciesIds, ['sp_blue']);
assert.equal(result.sources.length, 1);
assert.ok(result.attemptedUrls.includes('https://pmc.ncbi.nlm.nih.gov/articles/PMC3041685/'), 'legacy NCBI PMC URLs should normalize to the modern PMC article host');
assert.match(result.sources[0]?.contentSha256 || '', /^[a-f0-9]{64}$/);
assert.equal(result.promotionAllowed, false);
assert.equal(result.writesAuthority, false);
assert.equal('text' in (result.sources[0] || {}), false, 'raw source text must never be persisted');

console.log('Compatibility variant identity research PASS: grouped identity discovery is server-verified, quote-checked, draft-only, and does not persist raw source text.');
