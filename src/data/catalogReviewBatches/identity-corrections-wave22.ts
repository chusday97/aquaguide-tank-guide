import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-15T18:40:00+08:00';

export const identityCorrectionsWave22Sources = {
  arowanaBloodRedStrain: {
    id: 'aquaculture-research-scleropages-blood-red-identity-wave22',
    title: 'A strain-specific and a sex-associated STS marker for Asian arowana (Scleropages formosus, Osteoglossidae)',
    publisher: 'Aquaculture Research',
    url: 'https://doi.org/10.1046/j.1365-2109.2003.00949.x',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  arowanaFirstGradeRed: {
    id: 'kkp-scleropages-blood-red-first-grade-wave22',
    title: 'Peningkatan Total Karotenoid pada Ikan Arwana Super Red (Scleropages formosus) dengan Suplemen Astaxanthin dan Pencahayaan Tanning',
    publisher: 'Buletin Jalanidhitah Sarva Jivitam / Kementerian Kelautan dan Perikanan',
    url: 'https://doi.org/10.15578/bjsj.v4i2.11330',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identitySources = [
  identityCorrectionsWave22Sources.arowanaBloodRedStrain.id,
  identityCorrectionsWave22Sources.arowanaFirstGradeRed.id,
];
const fishBase = 'batch19-fishbase-scleropages-formosus';
const seriouslyFish = 'seriouslyfish-scleropages-formosus';
const territorialitySource = 'myfish-scleropages-formosus-territoriality';

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId: 'sp_0407',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsWave22FieldReviews: CatalogFieldReview[] = [
  supported(
    'identity',
    {
      scientificName: 'Scleropages formosus var. Blood Red A',
      baseSpeciesKey: 'Scleropages formosus',
      variantKey: 'Blood Red A',
    },
    identitySources,
    [
      'Aquaculture Research explicitly identifies blood-red as a strain of Asian arowana Scleropages formosus.',
      'The Indonesian fisheries journal explicitly classifies Blood Red and Chili Red as first-grade red arowana, directly covering the catalog object\'s Blood Red + A/first-grade wording.',
      'The correction resolves species identity only; A/first-grade is treated as a trade quality grade, not as independent biological husbandry authority.',
    ],
  ),
  supported('water', 'freshwater', [...identitySources, fishBase, seriouslyFish], [
    'The reviewed Blood Red first-grade identity bridge reuses established Scleropages formosus freshwater authority.',
  ]),
  supported('temperature', { min: 22, max: 28 }, [...identitySources, fishBase, seriouslyFish], [
    'The reviewed Blood Red first-grade identity bridge reuses the established Scleropages formosus long-term temperature authority.',
  ]),
  supported('ph', { min: 5, max: 8 }, [...identitySources, fishBase, seriouslyFish], [
    'The reviewed Blood Red first-grade identity bridge reuses the established Scleropages formosus pH authority.',
  ]),
  supported('adult_size', { min: null, max: 90 }, [...identitySources, fishBase, seriouslyFish], [
    'The reviewed Blood Red first-grade identity bridge reuses the established Scleropages formosus adult-size authority.',
  ]),
  supported('tank_size', { liters: null, lengthCm: 200 }, [...identitySources, seriouslyFish], [
    'The reviewed Blood Red first-grade identity bridge reuses the established same-species minimum aquarium length.',
  ]),
  supported('social_behavior', { mode: 'variable', minimumGroupSize: null }, [...identitySources, seriouslyFish], [
    'The reviewed Blood Red first-grade identity bridge reuses the established Scleropages formosus social authority.',
  ]),
  supported('territoriality', { traits: ['territorial'] }, [...identitySources, territorialitySource], [
    'The reviewed Blood Red first-grade identity bridge reuses the existing reviewed Scleropages formosus territoriality authority without adding grade-specific behavior.',
  ]),
  supported('predation', { targets: ['small_fish'] }, [...identitySources, seriouslyFish], [
    'The reviewed Blood Red first-grade identity bridge reuses the exact-species small-fish predation authority.',
  ]),
];

export const identityCorrectionsWave22VerifiedSourceIds = Object.values(identityCorrectionsWave22Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0407']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0407: 'sp_0103',
} as const;
