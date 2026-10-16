import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';
import { compatibilityResearchCoverageWave21Sources } from './research-coverage-wave21-20261015';

const reviewedAt = '2026-10-16T16:40:00+08:00';
const sourceId = compatibilityResearchCoverageWave21Sources.fishipedia_chrysiptera_cyanea.id;

/**
 * Wave23 closes only the two remaining Chrysiptera cyanea numeric gaps using
 * the already-reviewed exact-taxon Fishipedia source from wave21. The cached
 * verified page explicitly states "Taille maximale 8 cm" and
 * "Volume min 200 litres". No minimum adult size or aquarium length is inferred.
 */
export const compatibilityResearchCoverageWave23Sources = {} as const;

export const compatibilityResearchCoverageWave23FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0187',
    field: 'adult_size',
    proposedValue: { min: null, max: 8 },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'medium',
    citationIds: [sourceId],
    conflictNotes: [
      'Fishipedia exact-taxon Chrysiptera cyanea page explicitly states “Taille maximale 8 cm”; no minimum adult size is inferred.',
    ],
    reviewedAt,
  },
  {
    speciesId: 'sp_0187',
    field: 'tank_size',
    proposedValue: { liters: 200, lengthCm: null },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'medium',
    citationIds: [sourceId],
    conflictNotes: [
      'Fishipedia exact-taxon Chrysiptera cyanea maintenance section explicitly states “Volume min 200 litres”; no aquarium length minimum is inferred.',
    ],
    reviewedAt,
  },
];

export const compatibilityResearchCoverageWave23VerifiedSourceIds: string[] = [];

export const compatibilityResearchCoverageWave23ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0187',
    addCitationIds: [sourceId],
    addRequiredFacts: ['adult_size', 'tank_size'],
  },
] as const;

export const compatibilityResearchCoverageWave23AuthorityPatch = {
  patchId: 'research-coverage-wave23-20261016',
  speciesIds: ['sp_0187'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/research-coverage-wave23-20261016.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 2,
} as const;
