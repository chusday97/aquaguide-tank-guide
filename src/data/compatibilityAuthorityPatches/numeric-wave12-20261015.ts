import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T00:00:00+08:00';

export const compatibilityNumericWave12Sources = {
  otocinclusVittatusAquaInfo: {
    id: 'aquainfo-otocinclus-vittatus-wave12',
    title: 'Otocinclus vittatus – LDA023',
    publisher: 'AquaInfo',
    url: 'https://aquainfo.nl/en/article/otocinclus-vittatus-lda023/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const sourceId = compatibilityNumericWave12Sources.otocinclusVittatusAquaInfo.id;

export const compatibilityNumericWave12FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0013',
    field: 'predation',
    proposedValue: { targets: [] },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'medium',
    citationIds: [sourceId],
    conflictNotes: [
      'The exact Otocinclus vittatus AquaInfo page states under behavior toward other species that O. vittatus are very peaceful fish that harm no other fish. This is direct tankmate-harm evidence, not an inference from herbivory or a generic peaceful label.',
      'The same page separately notes occasional mucus-grazing attachment to slow-moving discus as a non-aggressive husbandry caveat; that behavior is not fish predation and does not change the empty fish-prey target set.',
    ],
    reviewedAt,
  },
];

export const compatibilityNumericWave12VerifiedSourceIds = Object.values(
  compatibilityNumericWave12Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityNumericWave12ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0013',
    replacePredationTargets: [],
    addCitationIds: [sourceId],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityNumericWave12AuthorityPatch = {
  patchId: 'numeric-evidence-wave12-20261015',
  speciesIds: ['sp_0013'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave12-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
