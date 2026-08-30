import { z } from 'zod';
import type { SpeciesFactKey, SpeciesProfile } from '../../packages/contracts/src';

/** Source-controlled field review record. Drafts never enter runtime Catalog. */
export const catalogFieldReviewSchema = z.object({
  speciesId: z.string().trim().min(1),
  field: z.enum([
    'identity', 'water', 'temperature', 'ph', 'adult_size', 'tank_size',
    'social_behavior', 'territoriality', 'predation', 'breeding_behavior',
  ]),
  proposedValue: z.unknown(),
  status: z.enum(['draft', 'reviewed', 'rejected']),
  confidence: z.enum(['high', 'medium', 'low', 'unknown']),
  citationIds: z.array(z.string().trim().min(1)),
  conflictNotes: z.array(z.string()),
  reviewedAt: z.string().datetime({ offset: true }).nullable(),
});

export type CatalogFieldReview = z.infer<typeof catalogFieldReviewSchema>;

export const REVIEWABLE_CATALOG_FIELDS: readonly SpeciesFactKey[] = [
  'identity', 'water', 'temperature', 'ph', 'adult_size', 'tank_size',
  'social_behavior', 'territoriality', 'predation', 'breeding_behavior',
];

/** Deliberately empty until a reviewer supplies values and citations. */
export const catalogFieldReviews: CatalogFieldReview[] = [];

export const getCatalogFieldReviews = (speciesId: string) => catalogFieldReviews.filter(item => item.speciesId === speciesId);

export const getApprovedCatalogFieldReviews = (speciesId: string) => getCatalogFieldReviews(speciesId)
  .filter(item => item.status === 'reviewed' && item.citationIds.length > 0);

export const isCatalogSpeciesFieldReady = (speciesId: string) => {
  const reviews = getApprovedCatalogFieldReviews(speciesId);
  return REVIEWABLE_CATALOG_FIELDS.every(field => reviews.some(item => item.field === field));
};

const finiteOrNull = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null;

/** Apply only reviewed values; malformed or partial records are ignored. */
export const applyApprovedCatalogFieldReviews = (profile: SpeciesProfile): SpeciesProfile => {
  let next = profile;
  for (const review of getApprovedCatalogFieldReviews(profile.id)) {
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
