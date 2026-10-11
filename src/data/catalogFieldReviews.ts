import { z } from 'zod';
import type { SpeciesFactKey, SpeciesProfile, SpeciesFactEvidence } from '../../packages/contracts/src';
import { catalogWaterTypeSchema } from '../../packages/contracts/src';
import { catalogReviewBatch01FieldReviews } from './catalogReviewBatches/batch-01';
import { catalogReviewBatch02 } from './catalogReviewBatches/batch-02';
import { catalogReviewBatch03FieldReviews } from './catalogReviewBatches/batch-03';
import { catalogReviewBatch01VerifiedSourceIds } from './catalogReviewBatches/batch-01';
import { catalogReviewBatch02VerifiedSourceIds } from './catalogReviewBatches/batch-02';
import { catalogReviewBatch03VerifiedSourceIds } from './catalogReviewBatches/batch-03';
import { catalogReviewBatch04FieldReviews, catalogReviewBatch04VerifiedSourceIds } from './catalogReviewBatches/batch-04';
import { nextWaveMarine01FieldReviews, nextWaveMarine01VerifiedSourceIds } from './catalogReviewBatches/next-wave-marine-01';
import { nextWaveFreshwater01FieldReviews, nextWaveFreshwater01VerifiedSourceIds } from './catalogReviewBatches/next-wave-freshwater-01';
import { nextWaveFreshwater02FieldReviews, nextWaveFreshwater02VerifiedSourceIds } from './catalogReviewBatches/next-wave-freshwater-02';
import { nextWaveFreshwater03FieldReviews, nextWaveFreshwater03VerifiedSourceIds } from './catalogReviewBatches/next-wave-freshwater-03';
import { nextWaveFreshwater04FieldReviews, nextWaveFreshwater04VerifiedSourceIds } from './catalogReviewBatches/next-wave-freshwater-04';
import { nextWaveUnified02FieldReviews, nextWaveUnified02VerifiedSourceIds } from './catalogReviewBatches/next-wave-unified-02';
import { nextWaveUnified03FieldReviews, nextWaveUnified03VerifiedSourceIds } from './catalogReviewBatches/next-wave-unified-03';
import { nextWaveUnified04FieldReviews, nextWaveUnified04VerifiedSourceIds } from './catalogReviewBatches/next-wave-unified-04';

/** Source-controlled field review record. Drafts never enter runtime Catalog. */
export const catalogFieldReviewSchema = z.object({
  speciesId: z.string().trim().min(1),
  field: z.enum([
    'identity', 'water', 'temperature', 'ph', 'adult_size', 'tank_size',
    'social_behavior', 'territoriality', 'predation', 'breeding_behavior',
  ]),
  proposedValue: z.unknown(),
  status: z.enum(['draft', 'reviewed', 'rejected']),
  resolution: z.enum(['supported', 'unknown']).nullable(),
  confidence: z.enum(['high', 'medium', 'low', 'unknown']),
  citationIds: z.array(z.string().trim().min(1)),
  conflictNotes: z.array(z.string()),
  reviewedAt: z.string().datetime({ offset: true }).nullable(),
});

export type CatalogFieldReview = z.infer<typeof catalogFieldReviewSchema>;
export type CatalogFieldResolution = NonNullable<CatalogFieldReview['resolution']>;

const nullableRangeSchema = z.object({
  min: z.number().finite().nonnegative().nullable(),
  max: z.number().finite().nonnegative().nullable(),
});

const fieldValueSchemas: Partial<Record<SpeciesFactKey, z.ZodType>> = {
  identity: z.object({
    scientificName: z.string().trim().min(1).optional(),
    baseSpeciesKey: z.string().trim().min(1).optional(),
    variantKey: z.string().trim().min(1).nullable().optional(),
  }).refine(value => Object.keys(value).length > 0),
  water: catalogWaterTypeSchema,
  temperature: nullableRangeSchema,
  ph: nullableRangeSchema,
  adult_size: nullableRangeSchema,
  tank_size: z.object({
    liters: z.number().finite().nonnegative().nullable(),
    lengthCm: z.number().finite().nonnegative().nullable(),
  }),
  social_behavior: z.object({
    mode: z.enum(['solitary', 'pair', 'group', 'colony', 'variable', 'unknown']),
    minimumGroupSize: z.number().int().positive().nullable(),
  }),
  territoriality: z.object({ traits: z.array(z.string().trim().min(1)) }),
  predation: z.object({ targets: z.array(z.string().trim().min(1)) }),
  breeding_behavior: z.object({ traits: z.array(z.string().trim().min(1)) }),
};

export const isCatalogFieldReviewValueValid = (review: CatalogFieldReview) => {
  if (review.status !== 'reviewed') return true;
  if (review.resolution === 'unknown') {
    return review.proposedValue === null && review.citationIds.length > 0 && review.conflictNotes.some(note => note.trim().length > 0);
  }
  if (review.resolution !== 'supported') return false;
  const schema = fieldValueSchemas[review.field];
  return schema ? schema.safeParse(review.proposedValue).success : false;
};

export const REVIEWABLE_CATALOG_FIELDS: readonly SpeciesFactKey[] = [
  'identity', 'water', 'temperature', 'ph', 'adult_size', 'tank_size',
  'social_behavior', 'territoriality', 'predation', 'breeding_behavior',
];

/** Aggregated source-controlled reviews; only reviewed+supported values overlay runtime profiles. */
export const catalogFieldReviews: CatalogFieldReview[] = [
  ...catalogReviewBatch01FieldReviews,
  ...catalogReviewBatch02,
  ...catalogReviewBatch03FieldReviews,
  ...catalogReviewBatch04FieldReviews,
  ...nextWaveMarine01FieldReviews,
  ...nextWaveFreshwater01FieldReviews,
  ...nextWaveFreshwater02FieldReviews,
  ...nextWaveFreshwater03FieldReviews,
  ...nextWaveFreshwater04FieldReviews,
  ...nextWaveUnified02FieldReviews,
  ...nextWaveUnified03FieldReviews,
  ...nextWaveUnified04FieldReviews,
];

/** Source content must be read and verified before any field can overlay runtime data. */
export const catalogContentVerifiedSourceIds = new Set([
  ...catalogReviewBatch01VerifiedSourceIds,
  ...catalogReviewBatch02VerifiedSourceIds,
  ...catalogReviewBatch03VerifiedSourceIds,
  ...catalogReviewBatch04VerifiedSourceIds,
  ...nextWaveMarine01VerifiedSourceIds,
  ...nextWaveFreshwater01VerifiedSourceIds,
  ...nextWaveFreshwater02VerifiedSourceIds,
  ...nextWaveFreshwater03VerifiedSourceIds,
  ...nextWaveFreshwater04VerifiedSourceIds,
  ...nextWaveUnified02VerifiedSourceIds,
  ...nextWaveUnified03VerifiedSourceIds,
  ...nextWaveUnified04VerifiedSourceIds,
]);

export const getCatalogFieldReviews = (speciesId: string) => catalogFieldReviews.filter(item => item.speciesId === speciesId);

export const getApprovedCatalogFieldReviews = (speciesId: string) => getCatalogFieldReviews(speciesId)
  .filter(item => item.status === 'reviewed' && item.resolution === 'supported' && item.citationIds.length > 0
    && item.citationIds.every(citationId => catalogContentVerifiedSourceIds.has(citationId))
    && isCatalogFieldReviewValueValid(item));

export const isCatalogSpeciesFieldReady = (speciesId: string) => {
  const reviews = getApprovedCatalogFieldReviews(speciesId);
  return REVIEWABLE_CATALOG_FIELDS.every(field => reviews.some(item => item.field === field));
};

const finiteOrNull = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null;

/** Apply only reviewed values; malformed or partial records are ignored. */
export const applyApprovedCatalogFieldReviews = (
  profile: SpeciesProfile,
  reviews: CatalogFieldReview[] = getApprovedCatalogFieldReviews(profile.id),
): SpeciesProfile => {
  let next = profile;
  for (const review of reviews.filter(item => item.status === 'reviewed' && item.resolution === 'supported' && item.citationIds.length > 0)) {
    if (!isCatalogFieldReviewValueValid(review)) continue;
    const factEvidence: SpeciesFactEvidence = {
      field: review.field,
      citationIds: review.citationIds,
      reviewStatus: review.status,
      confidence: review.confidence,
    };
    next = {
      ...next,
      evidenceSourceIds: Array.from(new Set([...(next.evidenceSourceIds ?? []), ...review.citationIds])),
      factEvidence: [...(next.factEvidence ?? []).filter(item => item.field !== review.field), factEvidence],
    };
    const value = review.proposedValue;
    if (review.field === 'identity' && typeof value === 'object' && value !== null) {
      const candidate = value as { scientificName?: unknown; baseSpeciesKey?: unknown; variantKey?: unknown };
      next = {
        ...next,
        ...(typeof candidate.scientificName === 'string' ? { scientificName: candidate.scientificName } : {}),
        ...(typeof candidate.baseSpeciesKey === 'string' ? { baseSpeciesKey: candidate.baseSpeciesKey } : {}),
        ...(typeof candidate.variantKey === 'string' ? { variantKey: candidate.variantKey } : {}),
      };
    }
    if (review.field === 'water' && ['freshwater', 'saltwater', 'brackish', 'unknown'].includes(String(value))) {
      next = { ...next, waterType: value as SpeciesProfile['waterType'] };
    }
    if ((review.field === 'temperature' || review.field === 'ph' || review.field === 'adult_size') && typeof value === 'object' && value !== null) {
      const candidate = value as { min?: unknown; max?: unknown };
      const min = finiteOrNull(candidate.min);
      const max = finiteOrNull(candidate.max);
      if (review.field === 'temperature') next = { ...next, waterTemperatureMinC: min, waterTemperatureMaxC: max };
      if (review.field === 'ph') next = { ...next, phMin: min, phMax: max };
      if (review.field === 'adult_size') next = { ...next, adultLengthMinCm: min, adultLengthMaxCm: max };
    }
    if (review.field === 'tank_size' && typeof value === 'object' && value !== null) {
      const candidate = value as { liters?: unknown; lengthCm?: unknown };
      next = { ...next, minTankLiters: finiteOrNull(candidate.liters), minTankLengthCm: finiteOrNull(candidate.lengthCm) };
    }
    if (review.field === 'social_behavior' && typeof value === 'object' && value !== null) {
      const candidate = value as { mode?: unknown; minimumGroupSize?: unknown };
      const modes = ['solitary', 'pair', 'group', 'colony', 'variable', 'unknown'];
      const socialMode = modes.includes(String(candidate.mode)) ? candidate.mode as SpeciesProfile['socialMode'] : 'unknown';
      next = { ...next, socialMode, minimumGroupSize: finiteOrNull(candidate.minimumGroupSize) };
    }
  }
  return next;
};


export const compatibilityDecisionBoundarySpeciesIds = new Set([
  'sp_0047', 'sp_0048', 'sp_0050', 'sp_0051', 'sp_0054', 'sp_0056', 'sp_0057', 'sp_0058',
  'sp_0059', 'sp_0062', 'sp_0105', 'sp_0108', 'sp_0109', 'sp_0119',
  'sp_0130', 'sp_0131', 'sp_0138', 'sp_0139', 'sp_0181',
]);

export const applyCatalogReviewDecisionBoundary = (
  profile: SpeciesProfile,
  reviews: CatalogFieldReview[] = getCatalogFieldReviews(profile.id),
): SpeciesProfile => {
  let next = applyApprovedCatalogFieldReviews(profile, reviews);
  if (!compatibilityDecisionBoundarySpeciesIds.has(profile.id)) return next;
  for (const review of reviews) {
    if (review.status !== 'reviewed' || review.resolution !== 'unknown' || !isCatalogFieldReviewValueValid(review)) continue;
    if (review.field === 'water') next = { ...next, waterType: 'unknown' };
    if (review.field === 'temperature') next = { ...next, waterTemperatureMinC: null, waterTemperatureMaxC: null };
    if (review.field === 'ph') next = { ...next, phMin: null, phMax: null };
    if (review.field === 'adult_size') next = { ...next, adultLengthMinCm: null, adultLengthMaxCm: null };
    if (review.field === 'tank_size') next = { ...next, minTankLiters: null, minTankLengthCm: null };
    if (review.field === 'social_behavior') next = { ...next, socialMode: 'unknown', minimumGroupSize: null };
  }
  return next;
};
