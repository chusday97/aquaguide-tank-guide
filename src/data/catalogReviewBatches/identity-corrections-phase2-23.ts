import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-21T23:45:00+09:00';

export const identityCorrectionsPhase2_23Sources = {
  calicoRanchuAquacultureReports: {
    id: 'phase2-23-aquaculture-reports-calico-ranchu',
    title: 'Comparative proteomic analyses of resistant and susceptible crucian carp to Gyrodactylus kobayashii infection',
    publisher: 'Aquaculture Reports',
    url: 'https://www.sciencedirect.com/science/article/pii/S2352513422002174',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

export const identityCorrectionsPhase2_23FieldReviews: CatalogFieldReview[] = [{
  speciesId: 'sp_0349',
  field: 'identity',
  proposedValue: {
    scientificName: 'Carassius auratus',
    baseSpeciesKey: 'Carassius auratus',
    variantKey: 'Calico Ranchu',
  },
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds: [identityCorrectionsPhase2_23Sources.calicoRanchuAquacultureReports.id],
  conflictNotes: [
    'The peer-reviewed Aquaculture Reports study samples 12 goldfish varieties and explicitly lists Calico ranchu in Table 1 as an egg-goldfish variety within the goldfish (Carassius auratus) study context, directly supporting the catalog Calico Ranchu identity.',
    'This resolves exact-form identity only. Calico Ranchu combines coloration and Ranchu body morphology, so no Compatibility husbandry, size, space, behavior, territoriality or predation fact is inherited automatically.',
  ],
  reviewedAt,
}];

export const identityCorrectionsPhase2_23VerifiedSourceIds = Object.values(identityCorrectionsPhase2_23Sources)
  .map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0349']);
export const catalogIdentityCorrectionBaseSpeciesIds = {} as const;
