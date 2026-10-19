import type { CatalogFieldReview } from '../catalogFieldReviews';
import { nextWaveUnified05Sources } from './next-wave-unified-05';

const reviewedAt = '2026-10-19T20:15:00+09:00';
const pelvicachromisSourceId = nextWaveUnified05Sources.pelvicachromis.id;

/**
 * Phase2-09 closes one source-controlled catalog duplication, not a biological
 * variant inference.
 *
 * sp_0338 and sp_0214 have the exact same catalog identity fingerprint:
 * Chinese display name, scientificName and fish category all match. sp_0214
 * already has reviewed object-level identity for the albino Pelvicachromis
 * pulcher sport and complete Compatibility authority from the reviewed
 * Seriously Fish source. Treat sp_0338 as a catalog alias of that exact
 * reviewed catalog object; do not infer anything for other look-alike variants.
 */
export const identityCorrectionsPhase2_09FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0338',
    field: 'identity',
    proposedValue: {
      scientificName: 'Pelvicachromis pulcher var. Albino',
      baseSpeciesKey: 'Pelvicachromis pulcher var. Albino',
      variantKey: 'same catalog object alias / sp_0214',
    },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'high',
    citationIds: [pelvicachromisSourceId],
    conflictNotes: [
      'sp_0338 and reviewed sp_0214 have the exact same catalog name, scientificName and category, so this correction is a duplicate-catalog-object alias rather than a new biological inheritance claim.',
      'sp_0214 already has reviewed object-level identity for the Pelvicachromis pulcher albino sport from the cited Seriously Fish source.',
      'Compatibility authority is inherited only from the exact reviewed duplicate sp_0214. No class-wide Platinum/Albino or visual-similarity rule is introduced.',
    ],
    reviewedAt,
  },
];

export const identityCorrectionsPhase2_09VerifiedSourceIds = new Set([pelvicachromisSourceId]);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0338']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0338: 'sp_0214',
} as const;
