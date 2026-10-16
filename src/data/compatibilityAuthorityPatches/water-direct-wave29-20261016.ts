import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-16T20:28:00+08:00';

const source = (
  id: string,
  title: string,
  publisher: string,
  url: string,
  sourceType: CatalogEvidenceSource['sourceType'],
): CatalogEvidenceSource => ({ id, title, publisher, url, sourceType, reviewStatus: 'reviewed' });

export const compatibilityWaterDirectWave29Sources = {
  nannostomusBeckfordiSeriouslyFish: source(
    'seriouslyfish-nannostomus-beckfordi-water-wave29',
    'Nannostomus beckfordi (Golden Pencilfish)',
    'Seriously Fish',
    'https://www.seriouslyfish.com/species/nannostomus-beckfordi',
    'curated_husbandry',
  ),
  nannostomusBeckfordiFishipedia: source(
    'fishipedia-nannostomus-beckfordi-water-wave29',
    'Nannostomus beckfordi freshwater husbandry',
    'Fishipedia',
    'https://www.fishipedia.fr/fr/poissons/nannostomus-beckfordi',
    'curated_husbandry',
  ),
} satisfies Record<string, CatalogEvidenceSource>;

const s = compatibilityWaterDirectWave29Sources;

export const compatibilityWaterDirectWave29FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0473',
    field: 'water',
    proposedValue: 'freshwater',
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'high',
    citationIds: [
      s.nannostomusBeckfordiSeriouslyFish.id,
      s.nannostomusBeckfordiFishipedia.id,
    ],
    conflictNotes: [
      'Exact accepted taxon Nannostomus beckfordi. Fishipedia explicitly states “Conditions d’élevage en eau douce” and describes rivers/swamps; Seriously Fish independently describes freshwater river distribution. No reviewed source in this packet indicates brackish or marine husbandry.',
      'Seriously Fish verified snapshot SHA-256: 0345e7bde2a0fdb67e3d6cdc6ab55742b6b362e0d0081d51a6fdeacb111c2e6d.',
      'Fishipedia verified snapshot SHA-256: f16c54fe37965da375d3be5dccd0791a4eaf7ce23026660240c29d13b2766bd5.',
    ],
    reviewedAt,
  },
];

export const compatibilityWaterDirectWave29VerifiedSourceIds = Object.values(
  compatibilityWaterDirectWave29Sources,
).map(item => item.id);

export const compatibilityWaterDirectWave29ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [] as const;

export const compatibilityWaterDirectWave29AuthorityPatch = {
  patchId: 'water-direct-wave29-20261016',
  speciesIds: ['sp_0473'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/water-direct-wave29-20261016.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 1,
  uniqueEvidencePageCount: 2,
} as const;
