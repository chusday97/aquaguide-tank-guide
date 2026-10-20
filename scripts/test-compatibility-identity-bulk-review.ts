import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import {
  buildIdentityBulkPreparation,
  deriveExactBinomialBase,
  selectIdentityResolutionWithVerifiedCache,
  type IdentityBulkQueueManifest,
} from '../src/services/compatibility/identity-bulk-research.service';

assert.equal(deriveExactBinomialBase('Pterophyllum scalare var. Marble Balloon'), 'Pterophyllum scalare');
assert.equal(deriveExactBinomialBase('Ancistrus sp. Gold'), null);
assert.equal(deriveExactBinomialBase('Leporacanthicus cf. galaxias'), null);

const cachedVerifiedResolution = {
  status: 'verified',
  queriedScientificName: 'Cyprinus carpio',
  canonicalName: 'Cyprinus carpio',
  externalId: '4286975',
  sourceUrl: 'https://www.gbif.org/species/4286975',
  confidence: 99,
  reasonCode: 'gbif_exact_accepted_species',
};
const providerUnavailableResolution = {
  status: 'provider_unavailable',
  queriedScientificName: 'Cyprinus carpio',
  canonicalName: null,
  externalId: null,
  sourceUrl: null,
  confidence: null,
  reasonCode: 'gbif_provider_unavailable',
};
const ambiguousResolution = {
  status: 'ambiguous',
  queriedScientificName: 'Cyprinus carpio',
  canonicalName: 'Cyprinus',
  externalId: 'x',
  sourceUrl: 'https://example.invalid',
  confidence: 50,
  reasonCode: 'gbif_match_requires_review',
};
assert.equal(
  selectIdentityResolutionWithVerifiedCache(providerUnavailableResolution, cachedVerifiedResolution).usedCachedVerified,
  true,
);
assert.equal(
  selectIdentityResolutionWithVerifiedCache(providerUnavailableResolution, cachedVerifiedResolution).resolution.status,
  'verified',
);
assert.equal(
  selectIdentityResolutionWithVerifiedCache(ambiguousResolution, cachedVerifiedResolution).usedCachedVerified,
  false,
);
assert.equal(
  selectIdentityResolutionWithVerifiedCache(ambiguousResolution, cachedVerifiedResolution).resolution.status,
  'ambiguous',
);

const queue = JSON.parse(readFileSync(
  'evaluation/product/compatibility-identity-review-queue.v1.json',
  'utf8',
)) as IdentityBulkQueueManifest;
const base = JSON.parse(readFileSync(
  'evaluation/product/compatibility-identity-bulk-base-resolution.v1.json',
  'utf8',
));
const review = JSON.parse(readFileSync(
  'evaluation/product/compatibility-identity-bulk-review.v1.json',
  'utf8',
));

const automated = queue.items.filter(item => item.automatedResearchAllowed);
const manual = queue.items.filter(item => !item.automatedResearchAllowed);
const preparation = buildIdentityBulkPreparation(queue, fishData);

assert.equal(automated.length, 0);
assert.equal(manual.length, queue.summary.manualReviewOnly);
assert.equal(manual.length, queue.items.length);
assert.equal(base.summary.totalAutomatedItems, automated.length);
assert.equal(base.items.length, automated.length);
assert.equal(review.summary.total, automated.length);
assert.equal(review.items.length, automated.length);
assert.equal(new Set(base.items.map((item: any) => item.speciesId)).size, automated.length);
assert.equal(new Set(review.items.map((item: any) => item.speciesId)).size, automated.length);
assert.deepEqual(
  [...base.items.map((item: any) => item.speciesId)].sort(),
  [...automated.map(item => item.speciesId)].sort(),
);
assert.equal(
  review.items.some((item: any) => manual.some(manualItem => manualItem.speciesId === item.speciesId)),
  false,
);
assert.equal(review.promotionAllowed, false);
assert.equal(review.writesAuthority, false);
assert.equal(review.items.every((item: any) => (
  item.requiresHumanReview
  && item.promotionAllowed === false
  && item.writesAuthority === false
  && item.fullInheritanceAllowed === false
)), true);
assert.equal(
  review.items
    .filter((item: any) => item.sourceQueue === 'partial_inheritance_review')
    .every((item: any) => item.fullInheritanceAllowed === false),
  true,
);
assert.equal(
  base.groups.every((group: any) => (
    group.objects.length > 0
    && group.objects.every((item: any) => item.status === 'identity_review_required')
  )),
  true,
);
assert.equal(
  base.groups.reduce((sum: number, group: any) => sum + group.objects.length, 0),
  base.summary.variantResearchObjects,
);
assert.equal(preparation.items.length, automated.length);
assert.equal(preparation.items.length, 0);
assert.equal(base.groups.length, 0);
assert.equal(base.summary.variantResearchObjects, 0);
assert.equal(
  review.summary.identityCandidateReady
  + review.summary.partialInheritanceCandidateReady
  + review.summary.taxonomyCandidateReady
  + review.summary.exactObjectEvidenceNotFoundThisPass
  + review.summary.researchRetryRequired
  + review.summary.parentOrTaxonomyUnresolved,
  automated.length,
);

console.log('Compatibility identity bulk review PASS:', JSON.stringify({
  base: base.summary,
  review: review.summary,
}));
