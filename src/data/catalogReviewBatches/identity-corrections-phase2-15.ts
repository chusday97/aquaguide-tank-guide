import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-21T10:00:00+08:00';

export const identityCorrectionsPhase2_15Sources = {
  fdaGlofishDanioRiskReview: {
    id: 'phase2-15-fda-glofish-danio-risk-reviewed-igas',
    title: 'Intentional Genomic Alterations (IGAs) in Animals: Risk-Reviewed IGAs',
    publisher: 'U.S. Food and Drug Administration',
    url: 'https://www.fda.gov/animal-veterinary/intentional-genomic-alterations-igas-animals/intentional-genomic-alterations-igas-animals-risk-reviewed-igas',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
  glofishZebraDanioColorCollection: {
    id: 'phase2-15-glofish-zebra-danio-single-color-collection',
    title: 'GloFish Zebra Danio Single Color Set',
    publisher: 'GloFish',
    url: 'https://shop.glofish.com/products/danio-single-color-collection',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identityReview = (
  speciesId: string,
  variantKey: string,
): CatalogFieldReview => ({
  speciesId,
  field: 'identity',
  proposedValue: {
    scientificName: 'Danio rerio',
    baseSpeciesKey: 'Danio rerio',
    variantKey,
  },
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds: [
    identityCorrectionsPhase2_15Sources.fdaGlofishDanioRiskReview.id,
    identityCorrectionsPhase2_15Sources.glofishZebraDanioColorCollection.id,
  ],
  conflictNotes: [
    'FDA risk-review records identify the corresponding fluorescent Red, Green, Orange and Purple danio lines as Danio rerio, while the official GloFish catalog groups these colors as Zebra Danio. This establishes a reviewed Danio rerio color-line identity bridge for Compatibility.',
    'This batch is deliberately color-only. It does not resolve the catalog Pink line, the generic “GloFish” label, or any Longfin line; morphology-changing and unverified commercial labels remain fail-closed until independently reviewed.',
  ],
  reviewedAt,
});

export const identityCorrectionsPhase2_15FieldReviews: CatalogFieldReview[] = [
  identityReview('sp_0289', 'Glo Red'),
  identityReview('sp_0290', 'Glo Green'),
  identityReview('sp_0291', 'Glo Orange'),
  identityReview('sp_0363', 'Glo Purple'),
];

export const identityCorrectionsPhase2_15VerifiedSourceIds = Object.values(identityCorrectionsPhase2_15Sources)
  .map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set([
  'sp_0289',
  'sp_0290',
  'sp_0291',
  'sp_0363',
]);

export const catalogIdentityCorrectionBaseSpeciesIds = {} as const;
