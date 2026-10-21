import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-21T23:30:00+09:00';

export const identityCorrectionsPhase2_21Sources = {
  seriouslyFishTanichthysColorStrains: {
    id: 'phase2-21-seriouslyfish-tanichthys-albonubes-color-strains',
    title: 'Tanichthys albonubes (White Cloud Mountain Minnow)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/tanichthys-albonubes/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  qualityMarineGoldenRoseline: {
    id: 'phase2-21-quality-marine-golden-roseline',
    title: 'The Golden Roseline',
    publisher: 'Quality Marine',
    url: 'https://www.qualitymarine.com/news/the-golden-roseline/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const colorIdentityReview = (
  speciesId: string,
  scientificName: string,
  variantKey: string,
  citationIds: string[],
  conflictNotes: string[],
): CatalogFieldReview => ({
  speciesId,
  field: 'identity',
  proposedValue: {
    scientificName,
    baseSpeciesKey: scientificName,
    variantKey,
  },
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsPhase2_21FieldReviews: CatalogFieldReview[] = [
  colorIdentityReview(
    'sp_0171',
    'Tanichthys albonubes',
    'Albino',
    [identityCorrectionsPhase2_21Sources.seriouslyFishTanichthysColorStrains.id],
    [
      'Seriously Fish explicitly lists albino among the ornamental strains of Tanichthys albonubes and states that care is identical to the standard fish. This supports an exact color-only identity bridge for the Albino catalog object.',
      'The bridge is deliberately limited to Albino. It does not resolve Longfin or Polar catalog objects, whose morphology or trade-line semantics remain independently gated.',
    ],
  ),
  colorIdentityReview(
    'sp_0196',
    'Sahyadria denisonii',
    'Gold',
    [identityCorrectionsPhase2_21Sources.qualityMarineGoldenRoseline.id],
    [
      'Quality Marine explicitly identifies the Golden Roseline as a variant of Sahyadria denisonii. This supports an exact Gold color-variant identity bridge without inferring a separate lineage.',
      'The bridge is deliberately limited to Gold. It does not resolve Longfin or Red Line catalog objects and does not add any pair-specific Compatibility rule.',
    ],
  ),
];

export const identityCorrectionsPhase2_21VerifiedSourceIds = Object.values(identityCorrectionsPhase2_21Sources)
  .map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set([
  'sp_0171',
  'sp_0196',
]);

// Color-morph promotion is handled by the generic reviewed-color policy in
// catalogCanonicalIdentity. No explicit pair/base override is needed here.
export const catalogIdentityCorrectionBaseSpeciesIds = {} as const;
