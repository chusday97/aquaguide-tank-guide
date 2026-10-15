import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-15T19:35:00+08:00';

export const identityCorrectionsWave23Sources = {
  swordtailAlbinoRedStudy: {
    id: 'pcmr-xiphophorus-hellerii-red-albino-wave23',
    title: 'A Recessive oca2 Mutation Underlies Albinism in Xiphophorus Fish',
    publisher: 'Pigment Cell & Melanoma Research',
    url: 'https://doi.org/10.1111/pcmr.70113',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  swordtailAlbinoStock: {
    id: 'txstate-xgsc-xiphophorus-hellerii-albino-wave23',
    title: 'Xiphophorus hellerii, Albino — Strain Protocol HeAlb',
    publisher: 'Xiphophorus Genetic Stock Center / Texas State University',
    url: 'https://gato-docs.its.txst.edu/jcr:09189664-929a-4f64-b0fb-220fa2ad7054/HeAlb.pdf',
    sourceType: 'university',
    reviewStatus: 'reviewed',
  },
  swordtailSeriouslyFish: {
    id: 'wave23-seriouslyfish-xiphophorus-hellerii-husbandry',
    title: 'Xiphophorus hellerii (Green Swordtail)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/xiphophorus-hellerii',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  swordtailFishBase: {
    id: 'wave23-fishbase-xiphophorus-hellerii-husbandry',
    title: 'Xiphophorus hellerii (Green swordtail) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/Summary/Xiphophorus-hellerii',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identitySources = [
  identityCorrectionsWave23Sources.swordtailAlbinoRedStudy.id,
  identityCorrectionsWave23Sources.swordtailAlbinoStock.id,
];
const seriouslyFish = identityCorrectionsWave23Sources.swordtailSeriouslyFish.id;
const fishBase = identityCorrectionsWave23Sources.swordtailFishBase.id;
const territorialitySources = [
  'australian-government-xiphophorus-hellerii-territoriality',
  'fishbase-xiphophorus-hellerii-male-aggression',
];

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId: 'sp_0236',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsWave23FieldReviews: CatalogFieldReview[] = [
  supported(
    'identity',
    {
      scientificName: 'Xiphophorus hellerii var. Albino Red',
      baseSpeciesKey: 'Xiphophorus hellerii',
      variantKey: 'Albino Red',
    },
    identitySources,
    [
      'The 2026 peer-reviewed Pigment Cell & Melanoma Research study directly reports Xiphophorus hellerii experimental phenotypes classified as Red albino, and describes albino X. hellerii as red-eyed while retaining erythrophore pigmentation.',
      'Texas State University Xiphophorus Genetic Stock Center independently maintains an Albino X. hellerii (HeAlb) stock and documents it as essentially pure X. hellerii Lancetilla selected for albinism.',
      'This correction is restricted to the catalog Albino Red / red-eye albino object. It does not authorize High Fin, Red Apple, or other compound swordtail trade morphs.',
    ],
  ),
  supported('water', 'freshwater', [...identitySources, seriouslyFish], [
    'The reviewed Albino Red identity bridge reuses established Xiphophorus hellerii freshwater authority; pigmentation is not treated as a separate water-domain taxon.',
  ]),
  supported('temperature', { min: 16, max: 28 }, [...identitySources, seriouslyFish], [
    'The reviewed Albino Red identity bridge reuses the established Xiphophorus hellerii long-term temperature authority.',
  ], 'medium'),
  supported('ph', { min: 7, max: 8 }, [...identitySources, seriouslyFish], [
    'The reviewed Albino Red identity bridge reuses the established Xiphophorus hellerii pH authority.',
  ], 'medium'),
  supported('adult_size', { min: null, max: 14 }, [...identitySources, seriouslyFish], [
    'The reviewed Albino Red identity bridge reuses the Xiphophorus hellerii adult-size authority; the pigment phenotype is not treated as an independent body-size lineage.',
  ]),
  supported('tank_size', { liters: 108, lengthCm: 120 }, [...identitySources, seriouslyFish], [
    'The reviewed Albino Red identity bridge reuses the established same-species minimum volume and horizontal aquarium length.',
  ]),
  supported('social_behavior', { mode: 'group', minimumGroupSize: null }, [...identitySources, seriouslyFish, fishBase], [
    'The reviewed Albino Red identity bridge reuses the Xiphophorus hellerii shoaling/community social authority without inventing a numeric minimum group size.',
  ]),
  supported('territoriality', { traits: ['male_conspecific_territoriality'] }, [...identitySources, ...territorialitySources], [
    'The reviewed Albino Red identity bridge preserves the established narrow scope: male conspecific hierarchy/territoriality, not generalized aggression toward all species.',
  ], 'medium'),
  supported('predation', { targets: [] }, [...identitySources, seriouslyFish, fishBase], [
    'The reviewed Albino Red identity bridge reuses the established Xiphophorus hellerii no-fish-predation target authority and does not infer a new prey scope from coloration.',
  ], 'medium'),
];

export const identityCorrectionsWave23VerifiedSourceIds = [
  ...Object.values(identityCorrectionsWave23Sources).map(source => source.id),
  ...territorialitySources,
];

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0236']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0236: 'sp_0438',
} as const;
