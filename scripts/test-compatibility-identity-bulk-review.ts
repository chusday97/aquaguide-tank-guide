import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import {
  buildIdentityBulkPreparation,
  deriveExactBinomialBase,
  type IdentityBulkQueueManifest,
} from '../src/services/compatibility/identity-bulk-research.service';

assert.equal(deriveExactBinomialBase('Pterophyllum scalare var. Marble Balloon'), 'Pterophyllum scalare');
assert.equal(deriveExactBinomialBase('Ancistrus sp. Gold'), null);
assert.equal(deriveExactBinomialBase('Leporacanthicus cf. galaxias'), null);

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

assert.equal(automated.length, 68);
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
assert.equal(preparation.items.length, 68);
assert.ok(preparation.items.filter(item => item.hasDeterministicBaseCandidate).length >= 50);
assert.equal(
  review.summary.identityCandidateReady
  + review.summary.partialInheritanceCandidateReady
  + review.summary.taxonomyCandidateReady
  + review.summary.exactObjectEvidenceNotFoundThisPass
  + review.summary.researchRetryRequired
  + review.summary.parentOrTaxonomyUnresolved,
  68,
);

console.log('Compatibility identity bulk review PASS:', JSON.stringify({
  base: base.summary,
  review: review.summary,
}));
