import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-15T19:45:00+08:00';

export const identityCorrectionsWave26Sources = {
  blueDiamondAquaticArts: {
    id: 'aquatic-arts-pterophyllum-scalare-blue-diamond-wave26',
    title: 'Blue Diamond Angelfish (Pterophyllum scalare) - Tank-Bred!',
    publisher: 'Aquatic Arts',
    url: 'https://aquaticarts.com/products/blue-diamond-angelfish',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  blueDiamondSwell: {
    id: 'swelluk-pterophyllum-scalare-blue-diamond-wave26',
    title: 'Blue Diamond Angelfish Pterophyllum Scalare',
    publisher: 'Swell UK',
    url: 'https://www.swelluk.com/blue-diamond-angelfish',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  baseFishBase: {
    id: 'wave26-fishbase-pterophyllum-scalare-husbandry',
    title: 'Pterophyllum scalare species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Pterophyllum-scalare.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  baseSeriouslyFish: {
    id: 'wave26-seriouslyfish-pterophyllum-scalare-husbandry',
    title: 'Pterophyllum scalare (Angelfish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/pterophyllum-scalare',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identitySources = [
  identityCorrectionsWave26Sources.blueDiamondAquaticArts.id,
  identityCorrectionsWave26Sources.blueDiamondSwell.id,
];
const baseSources = [
  identityCorrectionsWave26Sources.baseFishBase.id,
  identityCorrectionsWave26Sources.baseSeriouslyFish.id,
];

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'medium',
): CatalogFieldReview => ({
  speciesId: 'sp_0177',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsWave26FieldReviews: CatalogFieldReview[] = [
  supported(
    'identity',
    {
      scientificName: 'Pterophyllum scalare var. Blue Diamond',
      baseSpeciesKey: 'Pterophyllum scalare',
      variantKey: 'Blue Diamond',
    },
    identitySources,
    [
      'Aquatic Arts explicitly identifies Blue Diamond Angelfish as Pterophyllum scalare and describes it as a tank-bred angelfish variety with mature blue coloration.',
      'Swell UK independently identifies Blue Diamond Angelfish as Pterophyllum scalare.',
      'The legacy Chinese catalog label additionally claimed a red-eye trait. The reviewed Blue Diamond sources support the Blue Diamond colour form but do not establish a separate red-eye lineage, so Wave26 removes that unsupported modifier instead of preserving a compound identity.',
    ],
  ),
  supported('water', 'freshwater', [...identitySources, ...baseSources], [
    'The reviewed Blue Diamond identity bridge reuses established Pterophyllum scalare freshwater authority.',
  ]),
  supported('temperature', { min: 24, max: 30 }, [...identitySources, ...baseSources], [
    'The reviewed Blue Diamond identity bridge reuses the established Pterophyllum scalare husbandry temperature authority.',
  ]),
  supported('ph', { min: 6, max: 8 }, [...identitySources, ...baseSources], [
    'The reviewed Blue Diamond identity bridge reuses the established Pterophyllum scalare pH authority.',
  ]),
  supported('adult_size', { min: null, max: 15 }, [...identitySources, ...baseSources], [
    'The reviewed Blue Diamond identity bridge reuses the established Pterophyllum scalare adult-size authority.',
  ]),
  supported('tank_size', { liters: null, lengthCm: 100 }, [...identitySources, ...baseSources], [
    'The reviewed Blue Diamond identity bridge reuses the established same-species minimum horizontal tank length. The UI should also retain the tall-tank requirement from Species Knowledge.',
  ]),
  supported('social_behavior', { mode: 'group', minimumGroupSize: 5 }, [...identitySources, ...baseSources], [
    'The reviewed Blue Diamond identity bridge preserves the established same-species group/social authority rather than the legacy single-fish template.',
  ]),
  supported('territoriality', { traits: ['breeding_male_territoriality'] }, [...identitySources, ...baseSources], [
    'The reviewed Blue Diamond identity bridge preserves the established spawning/breeding territoriality boundary rather than generalized aggression.',
  ]),
  supported('predation', { targets: ['small_fish'] }, [...identitySources, ...baseSources], [
    'The reviewed Blue Diamond identity bridge preserves the established small-fish predation risk of adult Pterophyllum scalare.',
  ]),
];

export const identityCorrectionsWave26VerifiedSourceIds = Object.values(identityCorrectionsWave26Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0177']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0177: 'sp_0446',
} as const;
