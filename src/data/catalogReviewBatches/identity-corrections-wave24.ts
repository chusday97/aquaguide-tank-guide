import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-15T20:25:00+08:00';

export const identityCorrectionsWave24Sources = {
  gyrinocheilusAlbinoTetra: {
    id: 'tetra-gyrinocheilus-aymonieri-albino-wave24',
    title: 'Chinese Algae Eater – un pește fascinant, util în acvariu',
    publisher: 'Tetra Advanced Fishkeeper Blog',
    url: 'https://blog.tetra.net/ro-ro/chinese-algae-eater-un-peste-fascinant-util-in-acvariu/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identitySources = [
  'seriouslyfish-gyrinocheilus-aymonieri',
  identityCorrectionsWave24Sources.gyrinocheilusAlbinoTetra.id,
];
const baseFishBase = 'batch25-fishbase-gyrinocheilus-aymonieri';
const baseSeriouslyFish = 'seriouslyfish-gyrinocheilus-aymonieri';

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'medium',
): CatalogFieldReview => ({
  speciesId: 'sp_0229',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsWave24FieldReviews: CatalogFieldReview[] = [
  supported(
    'identity',
    {
      scientificName: 'Gyrinocheilus aymonieri var. Albino',
      baseSpeciesKey: 'Gyrinocheilus aymonieri',
      variantKey: 'Albino',
    },
    identitySources,
    [
      'Seriously Fish explicitly states that commercially produced Gyrinocheilus aymonieri includes several ornamental strains, specifically separating albino from golden, piebald, and short-bodied forms.',
      'Tetra independently identifies Chinese Algae Eater as Gyrinocheilus aymonieri and lists albino alongside golden and marbled colour forms.',
      'The correction is restricted to the catalog object explicitly named Albino. It does not merge golden/xanthic/leucistic trade forms into albino and does not resolve unrelated blank-variety Gyrinocheilus catalog objects.',
    ],
  ),
  supported('water', 'freshwater', [...identitySources, baseFishBase], [
    'The reviewed Albino identity bridge reuses established Gyrinocheilus aymonieri freshwater authority; the ornamental colour form is not treated as a separate water-domain taxon.',
  ]),
  supported('temperature', { min: 22, max: 26 }, [...identitySources, baseFishBase, baseSeriouslyFish], [
    'The reviewed Albino identity bridge reuses the established Gyrinocheilus aymonieri managed-husbandry temperature authority.',
  ]),
  supported('ph', { min: 6, max: 8 }, [...identitySources, baseFishBase, baseSeriouslyFish], [
    'The reviewed Albino identity bridge reuses the established Gyrinocheilus aymonieri pH authority.',
  ]),
  supported('adult_size', { min: null, max: 28 }, [...identitySources, baseFishBase, baseSeriouslyFish], [
    'The reviewed Albino identity bridge reuses the established Gyrinocheilus aymonieri adult-size authority; pigmentation alone is not treated as a separate body-size lineage.',
  ]),
  supported('tank_size', { liters: null, lengthCm: 150 }, [...identitySources, baseSeriouslyFish], [
    'The reviewed Albino identity bridge reuses the established same-species minimum horizontal aquarium length rather than the smaller legacy catalog volume.',
  ]),
  supported('social_behavior', { mode: 'variable', minimumGroupSize: null }, [...identitySources, baseSeriouslyFish], [
    'The reviewed Albino identity bridge reuses the established Gyrinocheilus aymonieri variable/social husbandry boundary and does not invent a numeric group minimum.',
  ]),
  supported('territoriality', {
    traits: ['age_increasing_territoriality', 'similar_fish_aggression', 'bottom_dweller_aggression'],
  }, [...identitySources, baseSeriouslyFish], [
    'The reviewed Albino identity bridge preserves the exact base-species boundary that territoriality and aggression increase with age, especially toward similar-looking or bottom-dwelling fishes.',
  ]),
  supported('predation', { targets: [] }, [...identitySources, baseSeriouslyFish], [
    'The reviewed Albino identity bridge reuses the established no-fish-predation target authority. Mucus-grazing aggression remains represented as a behavior risk and is not mislabeled as predation.',
  ]),
];

export const identityCorrectionsWave24VerifiedSourceIds = Object.values(identityCorrectionsWave24Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0229']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0229: 'sp_0441',
} as const;
