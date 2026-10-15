import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-15T20:45:00+08:00';

export const identityCorrectionsWave28Sources = {
  superRedAquaticArts: {
    id: 'aquatic-arts-pterophyllum-scalare-red-devil-wave28',
    title: "Red Devil Angelfish (Pterophyllum scalare 'Red Devil') - Tank Bred",
    publisher: 'Aquatic Arts',
    url: 'https://aquaticarts.com/products/red-devil-angelfish-pterophyllum-scalare-red-devil-tank-bred',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  superRedGarageAquatics: {
    id: 'garage-aquatics-pterophyllum-scalare-super-red-wave28',
    title: 'Red Devil Super Red Angelfish (Pterophyllum scalare)',
    publisher: 'Garage Aquatics',
    url: 'https://garageaquatics.com/products/live-freshwater-aquarium-red-devil-super-red-angelfish-for-sale-premium',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  baseFishBase: {
    id: 'wave28-fishbase-pterophyllum-scalare-husbandry',
    title: 'Pterophyllum scalare species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Pterophyllum-scalare.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  baseSeriouslyFish: {
    id: 'wave28-seriouslyfish-pterophyllum-scalare-husbandry',
    title: 'Pterophyllum scalare (Angelfish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/pterophyllum-scalare',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identitySources = [
  identityCorrectionsWave28Sources.superRedAquaticArts.id,
  identityCorrectionsWave28Sources.superRedGarageAquatics.id,
];
const baseSources = [
  identityCorrectionsWave28Sources.baseFishBase.id,
  identityCorrectionsWave28Sources.baseSeriouslyFish.id,
];

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'medium',
): CatalogFieldReview => ({
  speciesId: 'sp_0388',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsWave28FieldReviews: CatalogFieldReview[] = [
  supported(
    'identity',
    {
      scientificName: 'Pterophyllum scalare var. Super Red',
      baseSpeciesKey: 'Pterophyllum scalare',
      variantKey: 'Super Red / Red Devil',
    },
    identitySources,
    [
      "Aquatic Arts explicitly identifies Red Devil Angelfish as Pterophyllum scalare 'Red Devil'.",
      'Garage Aquatics independently labels the same trade line Red Devil Super Red Angelfish and identifies it as Pterophyllum scalare.',
      'Trade naming is not standardized, so Wave28 resolves only the catalog object already labeled Super Red. It does not generalize the bridge to the broader sp_0175 Red object or to koi/red-cap/red-dragon lines.',
    ],
  ),
  supported('water', 'freshwater', [...identitySources, ...baseSources], [
    'The reviewed Super Red / Red Devil identity bridge reuses established Pterophyllum scalare freshwater authority.',
  ]),
  supported('temperature', { min: 24, max: 30 }, [...identitySources, ...baseSources], [
    'The reviewed Super Red / Red Devil bridge reuses the established Pterophyllum scalare husbandry temperature authority.',
  ]),
  supported('ph', { min: 6, max: 8 }, [...identitySources, ...baseSources], [
    'The reviewed Super Red / Red Devil bridge reuses the established Pterophyllum scalare pH authority.',
  ]),
  supported('adult_size', { min: null, max: 15 }, [...identitySources, ...baseSources], [
    'The reviewed Super Red / Red Devil bridge reuses the established Pterophyllum scalare adult-size authority.',
  ]),
  supported('tank_size', { liters: null, lengthCm: 100 }, [...identitySources, ...baseSources], [
    'The reviewed Super Red / Red Devil bridge reuses the established minimum horizontal tank length; adequate tank height remains part of Species Knowledge.',
  ]),
  supported('social_behavior', { mode: 'group', minimumGroupSize: 5 }, [...identitySources, ...baseSources], [
    'The reviewed Super Red / Red Devil bridge preserves the established same-species group/social authority rather than the copied single-fish template.',
  ]),
  supported('territoriality', { traits: ['breeding_male_territoriality'] }, [...identitySources, ...baseSources], [
    'The reviewed Super Red / Red Devil bridge preserves the established breeding territoriality boundary.',
  ]),
  supported('predation', { targets: ['small_fish'] }, [...identitySources, ...baseSources], [
    'The reviewed Super Red / Red Devil bridge preserves the established small-fish predation risk of adult Pterophyllum scalare.',
  ]),
];

export const identityCorrectionsWave28VerifiedSourceIds = Object.values(identityCorrectionsWave28Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0388']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0388: 'sp_0446',
} as const;
