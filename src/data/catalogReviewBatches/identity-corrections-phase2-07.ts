import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-18T15:12:00+08:00';

export const identityCorrectionsPhase2_07Sources = {
  karbiAnglongFishbook: {
    id: 'fishbook-channa-stewartii-karbi-anglong-phase2-07',
    title: 'Channa stewartii “Karbi Anglong” — Karbi Anglong locality',
    publisher: 'FISHBOOK Taiwan',
    url: 'https://fishbook.com.tw/2019%E5%B9%B4-1-%E6%9C%88%E6%96%B0%E9%AD%9A%E5%BF%AB%E8%A8%8A/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  karbiAnglongGoldenAquaria: {
    id: 'golden-aquaria-channa-stewartii-karbi-anglong-phase2-07',
    title: 'Channa Stewartii — Karbi Anglong',
    publisher: 'Golden Aquaria',
    url: 'https://goldenaquaria.lk/shop/channa-stewartii-arunachal-3-5-4-inch/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identitySourceIds = Object.values(identityCorrectionsPhase2_07Sources).map(source => source.id);
const baseFishBase = 'batch21-fishbase-channa-stewartii';
const baseSeriouslyFish = 'seriouslyfish-channa-stewartii';
const basePredation = 'icar-cifa-channa-stewartii-live-fish';

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId: 'sp_0411',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

/**
 * Phase2-07 resolves Karbi Anglong as a geographic/locality form of Channa
 * stewartii. The locality sources establish object identity only. Compatibility
 * biology is inherited from the already-reviewed sp_0197 Channa stewartii
 * authority; no seller husbandry values are imported.
 */
export const identityCorrectionsPhase2_07FieldReviews: CatalogFieldReview[] = [
  supported('identity', {
    scientificName: 'Channa stewartii var. Karbi Anglong',
    baseSpeciesKey: 'Channa stewartii',
    variantKey: 'Karbi Anglong',
  }, identitySourceIds, [
    'Independent specialist aquarium sources explicitly pair the Karbi Anglong locality label with Channa stewartii.',
    'Karbi Anglong is treated as a geographic/locality label, not as a separate taxon or evidence that the catalog marketing phrase “特级选育” defines a biologically distinct strain.',
    'Identity evidence is separated from biology authority; Compatibility facts remain inherited from reviewed sp_0197 authority.',
  ]),
  supported('water', 'freshwater', [...identitySourceIds, baseFishBase, baseSeriouslyFish], [
    'Inherited from reviewed Channa stewartii base authority after exact Karbi Anglong identity resolution.',
  ]),
  supported('temperature', { min: 16, max: 25 }, [...identitySourceIds, baseFishBase, baseSeriouslyFish], [
    'Inherited from reviewed Channa stewartii base authority; locality-source seller temperatures are not imported.',
  ]),
  supported('ph', { min: 6, max: 8 }, [...identitySourceIds, baseFishBase, baseSeriouslyFish], [
    'Inherited from reviewed Channa stewartii base authority.',
  ]),
  supported('adult_size', { min: null, max: 29.7 }, [...identitySourceIds, baseFishBase, baseSeriouslyFish], [
    'Inherited from reviewed Channa stewartii base authority.',
  ]),
  supported('tank_size', { liters: null, lengthCm: 120 }, [...identitySourceIds, baseSeriouslyFish], [
    'Inherited from reviewed Channa stewartii husbandry authority.',
  ]),
  supported('social_behavior', { mode: 'variable', minimumGroupSize: null }, [...identitySourceIds, baseSeriouslyFish], [
    'Inherited from reviewed Channa stewartii authority; conspecific aggression remains a material risk.',
  ], 'medium'),
  supported('territoriality', { traits: ['intraspecific_aggression'] }, [...identitySourceIds, baseSeriouslyFish], [
    'Inherited from reviewed Channa stewartii territoriality authority.',
  ], 'medium'),
  supported('predation', { targets: [] }, [...identitySourceIds, basePredation], [
    'Inherited from the reviewed ICAR-CIFA Channa stewartii predation observation; the locality sources are not used to broaden prey-target claims.',
  ]),
];

export const identityCorrectionsPhase2_07VerifiedSourceIds = Object.values(identityCorrectionsPhase2_07Sources)
  .map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0411']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0411: 'sp_0197',
} as const;
