import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-18T18:30:00+08:00';

export const identityCorrectionsPhase2_08Sources = {
  chineseAlgaeEaterAquariumFish: {
    id: 'aquariumfishsale-gyrinocheilus-aymonieri-chinese-phase2-08',
    title: 'Chinese Algae Eater — Gyrinocheilus aymonieri',
    publisher: 'AquariumFish.com',
    url: 'https://aquariumfishsale.com/products/chinese-algae-eater-school-of-4',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  goldAlgaeEaterAquariumFish: {
    id: 'aquariumfishsale-gyrinocheilus-aymonieri-gold-phase2-08',
    title: 'Gold Algae Eater — Gyrinocheilus aymonieri (gold variety)',
    publisher: 'AquariumFish.com',
    url: 'https://aquariumfishsale.com/products/gold-algae-eater-group-of-3',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identitySourceIds = Object.values(identityCorrectionsPhase2_08Sources).map(source => source.id);

/**
 * Phase2-08 resolves a legacy catalog alias, not a biological variant.
 *
 * The catalog stored 青苔鼠 as "Gyrinocheilus aymonieri var." while a second
 * catalog object already holds the reviewed G. aymonieri Compatibility
 * authority. The supplier evidence distinguishes the ordinary Chinese Algae
 * Eater from the separately named gold variety. We therefore repair identity
 * only and inherit the reviewed exact-taxon authority without copying eight
 * Compatibility fact reviews.
 */
export const identityCorrectionsPhase2_08FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0442',
    field: 'identity',
    proposedValue: {
      scientificName: 'Gyrinocheilus aymonieri',
      baseSpeciesKey: 'Gyrinocheilus aymonieri',
      variantKey: 'same taxon / Chinese Algae Eater catalog alias',
    },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'high',
    citationIds: identitySourceIds,
    conflictNotes: [
      'AquariumFish.com explicitly identifies Chinese Algae Eater as Gyrinocheilus aymonieri.',
      'The same supplier separately identifies Gold Algae Eater as Gyrinocheilus aymonieri (gold variety), showing that the ordinary Chinese Algae Eater object is not itself a named gold variety.',
      'The blank "var." suffix on sp_0442 is treated as legacy catalog noise. This is a same-taxon catalog alias, not a biological variant.',
      'Compatibility facts inherit from the already-reviewed Gyrinocheilus aymonieri authority container; seller husbandry values are not imported as new Compatibility authority.',
    ],
    reviewedAt,
  },
];

export const identityCorrectionsPhase2_08VerifiedSourceIds = identitySourceIds;

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0442']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0442: 'sp_0441',
} as const;
