import assert from 'node:assert/strict';
import { catalogEvidenceSourceSchema } from '../packages/contracts/src';
import {
  catalogFieldReviewSchema,
  isCatalogFieldReviewValueValid,
  REVIEWABLE_CATALOG_FIELDS,
} from '../src/data/catalogFieldReviews';
import { LAUNCH_COHORT_IDS } from '../src/data/compatibility-launch-cohort';
import { catalogReviewBatch01FieldReviews, catalogReviewBatch01Sources } from '../src/data/catalogReviewBatches/batch-01';
import { catalogReviewBatch02, catalogReviewBatch02Sources } from '../src/data/catalogReviewBatches/batch-02';
import { catalogReviewBatch03FieldReviews, catalogReviewBatch03Sources } from '../src/data/catalogReviewBatches/batch-03';
import { catalogContentVerifiedSourceIds, getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';

const reviews = [...catalogReviewBatch01FieldReviews, ...catalogReviewBatch02, ...catalogReviewBatch03FieldReviews];
const sources = [...catalogReviewBatch01Sources, ...catalogReviewBatch02Sources, ...catalogReviewBatch03Sources];
const citationOwners = new Map<string, Set<string>>();
for (const review of reviews) for (const citationId of review.citationIds) {
  const owners = citationOwners.get(citationId) ?? new Set<string>();
  owners.add(review.speciesId);
  citationOwners.set(citationId, owners);
}
assert.equal(reviews.length, 300);
assert.equal(new Set(sources.map(source => source.id)).size, sources.length);
for (const source of sources) catalogEvidenceSourceSchema.parse(source);
for (const speciesId of LAUNCH_COHORT_IDS) {
  const rows = reviews.filter(review => review.speciesId === speciesId);
  assert.equal(rows.length, REVIEWABLE_CATALOG_FIELDS.length, speciesId);
  assert.equal(new Set(rows.map(review => review.field)).size, REVIEWABLE_CATALOG_FIELDS.length, speciesId);
  for (const review of rows) {
    const parsed = catalogFieldReviewSchema.parse(review);
    assert.equal(parsed.status, 'reviewed');
    assert.ok(parsed.citationIds.length > 0, `${speciesId}:${parsed.field} missing citation`);
    assert.ok(parsed.citationIds.every(id => sources.some(source => source.id === id && source.reviewStatus === 'reviewed')), `${speciesId}:${parsed.field} citation not reviewed`);
    assert.ok(parsed.citationIds.every(id => citationOwners.get(id)?.size === 1 && citationOwners.get(id)?.has(speciesId)), `${speciesId}:${parsed.field} citation not bound to species`);
    assert.equal(isCatalogFieldReviewValueValid(parsed), true, `${speciesId}:${parsed.field} invalid value`);
  }
}
const supported = reviews.filter(review => review.resolution === 'supported').length;
const unknown = reviews.filter(review => review.resolution === 'unknown').length;
assert.ok(catalogContentVerifiedSourceIds.size <= sources.length, 'verified source count cannot exceed source count');
const runtimeApprovedFields = reviews.filter(review => review.resolution === 'supported' && review.citationIds.every(id => catalogContentVerifiedSourceIds.has(id))).length;
console.log(JSON.stringify({ speciesCount: LAUNCH_COHORT_IDS.length, fieldCount: reviews.length, supported, unknown, contentVerifiedSources: catalogContentVerifiedSourceIds.size, runtimeApprovedFields }, null, 2));
