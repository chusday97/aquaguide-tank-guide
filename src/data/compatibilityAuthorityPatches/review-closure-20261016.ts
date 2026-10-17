import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';
import { compatibilityPredationWave24Sources } from './predation-wave24-20261016';

const reviewedAt = '2026-10-16T19:06:00+08:00';
const adw = compatibilityPredationWave24Sources.pomacanthusAnnularisAdw.id;

/** Closure for evidence that has already passed the persistent field-review queue. */
export const compatibilityReviewClosureSources = {} as const;

export const compatibilityReviewClosureFieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0185',
    field: 'ph',
    proposedValue: null,
    status: 'reviewed',
    resolution: 'unknown',
    confidence: 'high',
    citationIds: [adw],
    conflictNotes: [
      'The verified exact-taxon Animal Diversity Web account states that aquarium-kept Pomacanthus annularis has an optimal pH of 8.',
      'The source gives a point optimum, not a tolerated husbandry range. Compatibility requires a min-max range for pH overlap, so this observation is retained as reviewed_unknown and is not promoted to runtime pH authority.',
      'Verified cached source snapshot SHA-256: 02c71aba4a34e748d9904d12bcabd9264d1743b8898f10bc6ee4b0cbb9482606.',
    ],
    reviewedAt,
  },
];

export const compatibilityReviewClosureVerifiedSourceIds = [adw] as const;

export const compatibilityReviewClosureProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [];

export const compatibilityReviewClosureAuthorityPatch = {
  patchId: 'review-closure-20261016',
  speciesIds: ['sp_0185'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/review-closure-20261016.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 0,
} as const;
