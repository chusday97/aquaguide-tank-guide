import assert from 'node:assert/strict';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import {
  catalogFieldReviewSchema,
  getApprovedCatalogFieldReviews,
  isCatalogSpeciesFieldReady,
  REVIEWABLE_CATALOG_FIELDS,
} from '../src/data/catalogFieldReviews';

const cohort = selectCompatibilityLaunchCohort();
assert.equal(cohort.length, 30);
assert.equal(REVIEWABLE_CATALOG_FIELDS.length, 10);
assert.equal(getApprovedCatalogFieldReviews(cohort[0].id).length, 0);
assert.equal(isCatalogSpeciesFieldReady(cohort[0].id), false);

const draft = catalogFieldReviewSchema.parse({
  speciesId: cohort[0].id,
  field: 'water',
  proposedValue: 'freshwater',
  status: 'draft',
  confidence: 'unknown',
  citationIds: [],
  conflictNotes: [],
  reviewedAt: null,
});
assert.equal(draft.status, 'draft');
console.log(`catalog review contract: PASS (${cohort.length} species × ${REVIEWABLE_CATALOG_FIELDS.length} fields awaiting evidence)`);
