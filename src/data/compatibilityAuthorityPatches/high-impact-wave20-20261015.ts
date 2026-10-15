import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T21:05:00+09:00';
const seriouslyFish = 'wave05-seriouslyfish-salminus-brasiliensis';
const fishBase = 'wave05-fishbase-salminus-brasiliensis';

export const compatibilityHighImpactWave20Sources = {
  salminusSeriouslyFish: {
    id: 'wave05-seriouslyfish-salminus-brasiliensis',
    title: 'Salminus brasiliensis (Dorado)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/salminus-brasiliensis',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  salminusFishBase: {
    id: 'wave05-fishbase-salminus-brasiliensis',
    title: 'Salminus brasiliensis species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Salminus-brasiliensis',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  salminusBioflocStudy: {
    id: 'aquaculture-international-salminus-aggression-wave20',
    title: 'Biofloc technology (BFT) improves the productive performance and survival rate of Salminus brasiliensis',
    publisher: 'Aquaculture International',
    url: 'https://doi.org/10.1007/s10499-024-01644-8',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
): CatalogFieldReview => ({
  speciesId: 'sp_0173',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const compatibilityHighImpactWave20FieldReviews: CatalogFieldReview[] = [
  supported(
    'temperature',
    { min: 22, max: 28 },
    [seriouslyFish, fishBase],
    [
      'Seriously Fish gives 22–28°C as the explicit long-term water-condition range for Salminus brasiliensis. The prior Wave05 unknown is superseded by targeted re-review of the already-reviewed exact-species husbandry source, not by a wild-distribution inference.',
    ],
  ),
  supported(
    'ph',
    { min: 6, max: 7.5 },
    [seriouslyFish, fishBase],
    [
      'Seriously Fish gives pH 6.0–7.5 as the explicit water-condition range for Salminus brasiliensis. This is promoted from the exact-species husbandry profile after targeted re-review.',
    ],
  ),
  supported(
    'tank_size',
    { liters: null, lengthCm: 610 },
    [seriouslyFish, fishBase],
    [
      'Seriously Fish states that an adult requires a truly enormous tank or pond and gives roughly 20 ft × 4 ft × 4 ft as a bare minimum, over 9000 L. The patch records only the approximately 610 cm minimum length so it does not invent an exact liter threshold from the source\'s “over 9000 litres” wording.',
      'This requirement is consistent with the reviewed adult size of 100 cm and the source\'s warning that the species is beyond the reach of virtually all home aquarists.',
    ],
  ),
];

export const compatibilityHighImpactWave20VerifiedSourceIds = Object.values(
  compatibilityHighImpactWave20Sources,
).map(item => item.id);

export const compatibilityHighImpactWave20ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0173',
    addCitationIds: [seriouslyFish, fishBase, compatibilityHighImpactWave20Sources.salminusBioflocStudy.id],
    addRequiredFacts: ['temperature', 'ph', 'tank_size'],
  },
] as const;

export const compatibilityHighImpactWave20AuthorityPatch = {
  patchId: 'high-impact-salminus-evidence-wave20-20261015',
  speciesIds: ['sp_0173'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/high-impact-wave20-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
