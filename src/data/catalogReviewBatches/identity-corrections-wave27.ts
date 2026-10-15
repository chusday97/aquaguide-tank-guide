import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-15T20:20:00+08:00';

export const identityCorrectionsWave27Sources = {
  pandaAquaticArts: {
    id: 'aquatic-arts-pterophyllum-scalare-panda-wave27',
    title: 'Panda Angelfish (Pterophyllum scalare - variant), USA Bred',
    publisher: 'Aquatic Arts',
    url: 'https://aquaticarts.com/collections/locally-bred-fish/products/panda-angelfish-pterophyllum-scalare-variant-usa-bred',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  pandaAquapets: {
    id: 'aquapets-pterophyllum-scalare-panda-wave27',
    title: 'Panda Angel (Pterophyllum scalare)',
    publisher: 'Aquapets (KowloonAquarium)',
    url: 'https://www.aquapets.ca/products/panda-angel',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  baseFishBase: {
    id: 'wave27-fishbase-pterophyllum-scalare-husbandry',
    title: 'Pterophyllum scalare species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Pterophyllum-scalare.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  baseSeriouslyFish: {
    id: 'wave27-seriouslyfish-pterophyllum-scalare-husbandry',
    title: 'Pterophyllum scalare (Angelfish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/pterophyllum-scalare',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identitySources = [
  identityCorrectionsWave27Sources.pandaAquaticArts.id,
  identityCorrectionsWave27Sources.pandaAquapets.id,
];
const baseSources = [
  identityCorrectionsWave27Sources.baseFishBase.id,
  identityCorrectionsWave27Sources.baseSeriouslyFish.id,
];

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'medium',
): CatalogFieldReview => ({
  speciesId: 'sp_0178',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsWave27FieldReviews: CatalogFieldReview[] = [
  supported(
    'identity',
    {
      scientificName: 'Pterophyllum scalare var. Panda',
      baseSpeciesKey: 'Pterophyllum scalare',
      variantKey: 'Panda',
    },
    identitySources,
    [
      'Aquatic Arts explicitly identifies Panda Angelfish as a Pterophyllum scalare variant.',
      'Aquapets independently identifies Panda Angelfish as Pterophyllum scalare and describes it as a selectively bred fancy variety.',
      'Wave27 is scoped to the Panda object only; Red, Super Red, longfin, balloon, platinum, and other Pterophyllum trade morphs remain fail-closed until separately evidenced.',
    ],
  ),
  supported('water', 'freshwater', [...identitySources, ...baseSources], [
    'The reviewed Panda identity bridge reuses established Pterophyllum scalare freshwater authority.',
  ]),
  supported('temperature', { min: 24, max: 30 }, [...identitySources, ...baseSources], [
    'The reviewed Panda identity bridge reuses the established Pterophyllum scalare husbandry temperature authority.',
  ]),
  supported('ph', { min: 6, max: 8 }, [...identitySources, ...baseSources], [
    'The reviewed Panda identity bridge reuses the established Pterophyllum scalare pH authority.',
  ]),
  supported('adult_size', { min: null, max: 15 }, [...identitySources, ...baseSources], [
    'The reviewed Panda identity bridge reuses the established Pterophyllum scalare adult-size authority.',
  ]),
  supported('tank_size', { liters: null, lengthCm: 100 }, [...identitySources, ...baseSources], [
    'The reviewed Panda identity bridge reuses the established minimum horizontal tank length; adequate tank height remains part of Species Knowledge.',
  ]),
  supported('social_behavior', { mode: 'group', minimumGroupSize: 5 }, [...identitySources, ...baseSources], [
    'The reviewed Panda identity bridge preserves the established same-species group/social authority rather than the copied single-fish template.',
  ]),
  supported('territoriality', { traits: ['breeding_male_territoriality'] }, [...identitySources, ...baseSources], [
    'The reviewed Panda identity bridge preserves the established breeding territoriality boundary.',
  ]),
  supported('predation', { targets: ['small_fish'] }, [...identitySources, ...baseSources], [
    'The reviewed Panda identity bridge preserves the established small-fish predation risk of adult Pterophyllum scalare.',
  ]),
];

export const identityCorrectionsWave27VerifiedSourceIds = Object.values(identityCorrectionsWave27Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0178']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0178: 'sp_0446',
} as const;
