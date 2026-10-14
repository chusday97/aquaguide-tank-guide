import assert from 'node:assert/strict';

import { createGbifSpeciesIdentityResolver } from '../src/services/compatibility/gbif-species-identity.service';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json' },
});

const exactResolver = createGbifSpeciesIdentityResolver({
  fetchImpl: async input => {
    const url = new URL(String(input));
    assert.equal(url.hostname, 'api.gbif.org');
    assert.equal(url.searchParams.get('name'), 'Pseudomugil luminatus');
    assert.equal(url.searchParams.get('verbose'), 'true');
    return response({
      usageKey: 987654,
      canonicalName: 'Pseudomugil luminatus',
      scientificName: 'Pseudomugil luminatus Allen, Unmack & Hadiaty, 2016',
      rank: 'SPECIES',
      status: 'ACCEPTED',
      confidence: 99,
      matchType: 'EXACT',
    });
  },
});
const exact = await exactResolver.resolve('Pseudomugil luminatus');
assert.deepEqual(exact, {
  status: 'verified',
  queriedScientificName: 'Pseudomugil luminatus',
  canonicalName: 'Pseudomugil luminatus',
  externalId: '987654',
  sourceUrl: 'https://www.gbif.org/species/987654',
  confidence: 99,
  reasonCode: 'gbif_exact_accepted_species',
});

const fuzzyResolver = createGbifSpeciesIdentityResolver({
  fetchImpl: async () => response({
    usageKey: 987654,
    canonicalName: 'Pseudomugil luminatus',
    rank: 'SPECIES',
    status: 'ACCEPTED',
    confidence: 91,
    matchType: 'FUZZY',
  }),
});
const fuzzy = await fuzzyResolver.resolve('Pseudomugil luminatuz');
assert.equal(fuzzy.status, 'ambiguous');
assert.equal(fuzzy.reasonCode, 'gbif_match_requires_review');

const synonymResolver = createGbifSpeciesIdentityResolver({
  fetchImpl: async () => response({
    usageKey: 987654,
    canonicalName: 'Pseudomugil luminatus',
    rank: 'SPECIES',
    status: 'SYNONYM',
    confidence: 100,
    matchType: 'EXACT',
  }),
});
assert.equal((await synonymResolver.resolve('Pseudomugil luminatus')).status, 'ambiguous');

const noMatchResolver = createGbifSpeciesIdentityResolver({
  fetchImpl: async () => response({ matchType: 'NONE', confidence: 0 }),
});
assert.equal((await noMatchResolver.resolve('Unknown fish')).status, 'unresolved');

const unavailableResolver = createGbifSpeciesIdentityResolver({
  fetchImpl: async () => response({}, 503),
});
const unavailable = await unavailableResolver.resolve('Pseudomugil luminatus');
assert.equal(unavailable.status, 'provider_unavailable');
assert.equal(unavailable.reasonCode, 'gbif_http_503');

console.log('GBIF species identity PASS: only exact accepted high-confidence species matches verify; fuzzy/synonym/no-match/provider failures fail closed.');
