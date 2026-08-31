import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import {
  applyApprovedCatalogFieldReviews,
  catalogFieldReviewSchema,
  getApprovedCatalogFieldReviews,
  isCatalogFieldReviewValueValid,
  isCatalogSpeciesFieldReady,
  REVIEWABLE_CATALOG_FIELDS,
} from '../src/data/catalogFieldReviews';
import { speciesProfileFromFish } from '../src/services/catalog/species-profile.adapter';
import {
  catalogReviewSourceCandidateIds,
  getCatalogReviewSourceCandidates,
} from '../src/data/catalogReviewSourceCandidates';

const cohort = selectCompatibilityLaunchCohort();
assert.equal(cohort.length, 30);
assert.equal(REVIEWABLE_CATALOG_FIELDS.length, 10);
assert.equal(getApprovedCatalogFieldReviews(cohort[0].id).length, 0);
assert.equal(isCatalogSpeciesFieldReady(cohort[0].id), false);
assert.equal(catalogReviewSourceCandidateIds.length, 10);
assert.equal(getCatalogReviewSourceCandidates(cohort[0].id)[0].reviewStatus, 'draft');
assert.equal(getCatalogReviewSourceCandidates(cohort[0].id)[0].publisher, 'FishBase');
assert.deepEqual(getCatalogReviewSourceCandidates(cohort[10].id), []);
assert.deepEqual(
  [...catalogReviewSourceCandidateIds].sort(),
  cohort.slice(0, 10)
    .map(species => getCatalogReviewSourceCandidates(species.id)[0]?.id)
    .filter((id): id is string => Boolean(id))
    .sort(),
);

const draft = catalogFieldReviewSchema.parse({
  speciesId: cohort[0].id,
  field: 'water',
  proposedValue: 'freshwater',
  status: 'draft',
  resolution: null,
  confidence: 'unknown',
  citationIds: [],
  conflictNotes: [],
  reviewedAt: null,
});
assert.equal(draft.status, 'draft');

const reviewedBehavior = catalogFieldReviewSchema.parse({
  speciesId: cohort[0].id,
  field: 'territoriality',
  proposedValue: { traits: ['territorial'] },
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds: ['reviewed-source'],
  conflictNotes: [],
  reviewedAt: '2026-08-30T00:00:00.000Z',
});
assert.equal(isCatalogFieldReviewValueValid(reviewedBehavior), true);
const reviewedUnknown = catalogFieldReviewSchema.parse({
  ...reviewedBehavior,
  proposedValue: null,
  resolution: 'unknown',
  conflictNotes: ['Professional sources do not establish a reliable threshold.'],
});
assert.equal(isCatalogFieldReviewValueValid(reviewedUnknown), true);
const invalidBehavior = { ...reviewedBehavior, proposedValue: { traits: [''] } };
assert.equal(isCatalogFieldReviewValueValid(invalidBehavior), false);
const profile = speciesProfileFromFish(cohort[0]);
assert.equal(applyApprovedCatalogFieldReviews(profile, [reviewedUnknown]).factEvidence?.some(item => item.field === 'territoriality'), false);
const overlaid = applyApprovedCatalogFieldReviews(profile, [reviewedBehavior]);
assert.deepEqual(overlaid.factEvidence?.find(item => item.field === 'territoriality'), {
  field: 'territoriality',
  citationIds: ['reviewed-source'],
  reviewStatus: 'reviewed',
  confidence: 'high',
});

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'catalog-review-contract-'));
const invalidCitationInput = join(temporaryDirectory, 'invalid-citation.json');
const positiveInput = join(temporaryDirectory, 'positive.json');
const invalidCitationPayload = {
  species: [{
    speciesId: cohort[0].id,
    status: 'reviewed',
    sources: [{
      id: 'reviewed-source',
      title: 'Reviewed source',
      publisher: 'Test publisher',
      url: 'https://example.com/source',
      sourceType: 'professional_association',
      reviewStatus: 'reviewed',
    }],
    fieldReviews: REVIEWABLE_CATALOG_FIELDS.map(field => ({
      field,
      proposedValue: field === 'water' ? 'freshwater' : null,
      status: field === 'water' ? 'reviewed' : 'draft',
      resolution: field === 'water' ? 'supported' : null,
      confidence: field === 'water' ? 'high' : 'unknown',
      citationIds: field === 'water' ? ['missing-source'] : [],
      conflictNotes: [],
      reviewedAt: field === 'water' ? '2026-08-30T00:00:00.000Z' : null,
    })),
  }],
};
await writeFile(invalidCitationInput, JSON.stringify(invalidCitationPayload));
assert.throws(() => execFileSync(process.execPath, ['--import', 'tsx', 'scripts/catalog-review.ts', '--input', invalidCitationInput], { encoding: 'utf8' }));

const reviewedValues: Record<string, unknown> = {
  identity: { scientificName: 'Paracheirodon innesi' },
  water: 'freshwater',
  temperature: { min: 22, max: 28 },
  ph: { min: 6, max: 7 },
  adult_size: { min: 3, max: 4 },
  tank_size: { liters: 40, lengthCm: 60 },
  social_behavior: { mode: 'group', minimumGroupSize: 6 },
  territoriality: { traits: [] },
  predation: { targets: [] },
  breeding_behavior: { traits: [] },
};
const positivePayload = {
  species: [{
    speciesId: cohort[0].id,
    status: 'reviewed',
    sources: invalidCitationPayload.species[0].sources,
    fieldReviews: REVIEWABLE_CATALOG_FIELDS.map(field => ({
      field,
      proposedValue: reviewedValues[field],
      status: 'reviewed',
      resolution: 'supported',
      confidence: 'high',
      citationIds: ['reviewed-source'],
      conflictNotes: [],
      reviewedAt: '2026-08-30T00:00:00.000Z',
    })),
  }],
};
await writeFile(positiveInput, JSON.stringify(positivePayload));
const positiveOutput = execFileSync(process.execPath, ['--import', 'tsx', 'scripts/catalog-review.ts', '--input', positiveInput], { encoding: 'utf8' });
const positiveReport = JSON.parse(positiveOutput) as { reviewedCount: number; reviewedFieldCount: number };
assert.equal(positiveReport.reviewedCount, 1);
assert.equal(positiveReport.reviewedFieldCount, REVIEWABLE_CATALOG_FIELDS.length);
const duplicatePayload = structuredClone(positivePayload);
duplicatePayload.species[0].fieldReviews.push(duplicatePayload.species[0].fieldReviews[0]);
const duplicateInput = join(temporaryDirectory, 'duplicate-field.json');
await writeFile(duplicateInput, JSON.stringify(duplicatePayload));
assert.throws(() => execFileSync(process.execPath, ['--import', 'tsx', 'scripts/catalog-review.ts', '--input', duplicateInput], { encoding: 'utf8' }));
await rm(temporaryDirectory, { recursive: true, force: true });
console.log(`catalog review contract: PASS (${cohort.length} species × ${REVIEWABLE_CATALOG_FIELDS.length} fields contract)`);
