import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-17T23:26:00+08:00';

export const identityCorrectionsWave29Sources = {
  platinumVeiltailAquaticArts: {
    id: 'aquatic-arts-pterophyllum-scalare-platinum-veiltail-wave29',
    title: 'Platinum Veiltail Angelfish (Pterophyllum scalare) – Tank-Bred',
    publisher: 'Aquatic Arts',
    url: 'https://aquaticarts.com/collections/angelfish/products/platinum-veiltail-angelfish-pterophyllum-scalare-tank-bred',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  veilCatalogQualityMarine: {
    id: 'quality-marine-pterophyllum-scalare-veil-catalog-wave29',
    title: 'Veil Angelfish catalog: Black Veil and Platinum Veil (Pterophyllum scalare)',
    publisher: 'Quality Marine / Aquatropic',
    url: 'https://www.qualitymarine.com/aquatropic/fish/angelfish/veil/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  blackVeilPeerReviewed: {
    id: 'aquaculture-pterophyllum-scalare-black-veil-wave29',
    title: 'Use of eugenol for the anaesthesia and transportation of freshwater angelfish (Pterophyllum scalare)',
    publisher: 'Aquaculture',
    url: 'https://www.sciencedirect.com/science/article/pii/S0044848619304995',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  baseFishBase: {
    id: 'wave29-fishbase-pterophyllum-scalare-husbandry',
    title: 'Pterophyllum scalare species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Pterophyllum-scalare.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  baseSeriouslyFish: {
    id: 'wave29-seriouslyfish-pterophyllum-scalare-husbandry',
    title: 'Pterophyllum scalare (Angelfish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/pterophyllum-scalare',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const baseSources = [
  identityCorrectionsWave29Sources.baseFishBase.id,
  identityCorrectionsWave29Sources.baseSeriouslyFish.id,
];

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'medium',
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

const bridge = (
  speciesId: string,
  scientificName: string,
  variantKey: string,
  identitySourceIds: string[],
): CatalogFieldReview[] => [
  supported(
    speciesId,
    'identity',
    {
      scientificName,
      baseSpeciesKey: 'Pterophyllum scalare',
      variantKey,
    },
    identitySourceIds,
    [
      'Object-level sources explicitly identify this longfin/veil trade form as Pterophyllum scalare.',
      'Wave29 is intentionally scoped to longfin/veil morphology only. Balloon, compound colour/balloon, and unrelated trade morphs remain fail-closed unless separately evidenced.',
    ],
  ),
  supported(speciesId, 'water', 'freshwater', [...identitySourceIds, ...baseSources], [
    'The reviewed longfin/veil identity bridge reuses established Pterophyllum scalare freshwater authority.',
  ]),
  supported(speciesId, 'temperature', { min: 24, max: 30 }, [...identitySourceIds, ...baseSources], [
    'The reviewed longfin/veil identity bridge reuses established Pterophyllum scalare husbandry temperature authority.',
  ]),
  supported(speciesId, 'ph', { min: 6, max: 8 }, [...identitySourceIds, ...baseSources], [
    'The reviewed longfin/veil identity bridge reuses established Pterophyllum scalare pH authority.',
  ]),
  supported(speciesId, 'adult_size', { min: null, max: 15 }, [...identitySourceIds, ...baseSources], [
    'The reviewed longfin/veil identity bridge reuses established Pterophyllum scalare adult body-size authority; elongated fins are not converted into a larger body-length rule.',
  ]),
  supported(speciesId, 'tank_size', { liters: null, lengthCm: 100 }, [...identitySourceIds, ...baseSources], [
    'The reviewed longfin/veil identity bridge reuses the established minimum horizontal tank length; adequate vertical swimming space remains part of Species Knowledge.',
  ]),
  supported(speciesId, 'social_behavior', { mode: 'group', minimumGroupSize: 5 }, [...identitySourceIds, ...baseSources], [
    'The reviewed longfin/veil identity bridge preserves established same-species group/social authority rather than the legacy single-fish template.',
  ]),
  supported(speciesId, 'territoriality', { traits: ['breeding_male_territoriality'] }, [...identitySourceIds, ...baseSources], [
    'The reviewed longfin/veil identity bridge preserves the established breeding territoriality boundary.',
  ]),
  supported(speciesId, 'predation', { targets: ['small_fish'] }, [...identitySourceIds, ...baseSources], [
    'The reviewed longfin/veil identity bridge preserves established adult Pterophyllum scalare small-fish predation risk.',
  ]),
];

export const identityCorrectionsWave29FieldReviews: CatalogFieldReview[] = [
  ...bridge(
    'sp_0240',
    'Pterophyllum scalare var. Platinum Longfin',
    'Platinum Veiltail / Longfin',
    [
      identityCorrectionsWave29Sources.platinumVeiltailAquaticArts.id,
      identityCorrectionsWave29Sources.veilCatalogQualityMarine.id,
    ],
  ),
  ...bridge(
    'sp_0272',
    'Pterophyllum scalare var. Black Longfin',
    'Black Veil / Longfin',
    [
      identityCorrectionsWave29Sources.blackVeilPeerReviewed.id,
      identityCorrectionsWave29Sources.veilCatalogQualityMarine.id,
    ],
  ),
];

export const identityCorrectionsWave29VerifiedSourceIds = Object.values(identityCorrectionsWave29Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0240', 'sp_0272']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0240: 'sp_0446',
  sp_0272: 'sp_0446',
} as const;
