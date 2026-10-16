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
    proposedValue: { min: 8, max: 8 },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'high',
    citationIds: [adw],
    conflictNotes: [
      'The verified exact-taxon Animal Diversity Web account states that aquarium-kept Pomacanthus annularis has an optimal pH of 8.',
      'The source gives a point optimum, not a husbandry range. Authority stores pH 8 as the reviewed point value and does not invent a wider range.',
      'Verified cached source snapshot SHA-256: 02c71aba4a34e748d9904d12bcabd9264d1743b8898f10bc6ee4b0cbb9482606.',
    ],
    reviewedAt,
  },
];

export const compatibilityReviewClosureVerifiedSourceIds = [adw] as const;

export const compatibilityReviewClosureProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0185',
    addCitationIds: [adw],
    addRequiredFacts: ['ph'],
  },
] as const;

export const compatibilityReviewClosureAuthorityPatch = {
  patchId: 'review-closure-20261016',
  speciesIds: ['sp_0185'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/review-closure-20261016.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 1,
} as const;
