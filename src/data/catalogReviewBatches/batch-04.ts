import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-10T00:00:00+08:00';

export const kissingGouramiFishBase: CatalogEvidenceSource = {
  id: 'batch04-fishbase-helostoma-temminkii',
  title: 'Helostoma temminkii (Kissing gourami) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Helostoma-temminckii',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

export const kissingGouramiSeriouslyFish: CatalogEvidenceSource = {
  id: 'batch04-seriouslyfish-helostoma-temminkii',
  title: 'Helostoma temminkii (Kissing Gourami)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/helostoma-temminkii',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[] = [],
): CatalogFieldReview => ({
  speciesId: 'sp_0015',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'medium',
  citationIds,
  conflictNotes,
  reviewedAt,
});

const unknown = (
  field: CatalogFieldReview['field'],
  conflictNote: string,
): CatalogFieldReview => ({
  speciesId: 'sp_0015',
  field,
  proposedValue: null,
  status: 'reviewed',
  resolution: 'unknown',
  confidence: 'unknown',
  citationIds: [kissingGouramiFishBase.id, kissingGouramiSeriouslyFish.id],
  conflictNotes: [conflictNote],
  reviewedAt,
});

export const catalogReviewBatch04FieldReviews: CatalogFieldReview[] = [
  supported('identity', {
    scientificName: 'Helostoma temminkii',
    baseSpeciesKey: 'Helostoma temminkii',
    variantKey: null,
  }, [kissingGouramiFishBase.id]),
  supported('water', 'freshwater', [kissingGouramiFishBase.id]),
  supported('temperature', { min: 22, max: 28 }, [kissingGouramiFishBase.id], [
    'Seriously Fish gives 22–30°C; the narrower FishBase 22–28°C range is retained for compatibility planning.',
  ]),
  supported('ph', { min: 6, max: 8 }, [kissingGouramiFishBase.id, kissingGouramiSeriouslyFish.id]),
  supported('adult_size', { min: null, max: 30 }, [kissingGouramiFishBase.id]),
  supported('tank_size', { liters: 304, lengthCm: 150 }, [kissingGouramiSeriouslyFish.id]),
  supported('social_behavior', { mode: 'variable', minimumGroupSize: null }, [kissingGouramiSeriouslyFish.id], [
    'Adults are not obligatorily gregarious; groups can be kept only with sufficient space. No minimum group size is asserted.',
  ]),
  supported('territoriality', {
    traits: [
      '空间不足时可对同类或相似体型鱼表现攻击',
      '接吻行为至少部分与社会支配建立有关',
    ],
  }, [kissingGouramiSeriouslyFish.id], [
    'The source says territorial boundaries are possible but not confirmed, so the reviewed claim is scoped to aggression/dominance rather than permanent territoriality.',
  ]),
  unknown('predation', 'Sources indicate it cannot prey on fishes larger than a few millimetres, but no reviewed prey-size rule is promoted for this product.'),
  unknown('breeding_behavior', 'Spawning biology is described, but no compatibility-relevant parental aggression or guarding rule is supported.'),
];

export const catalogReviewBatch04VerifiedSourceIds = new Set([
  kissingGouramiFishBase.id,
  kissingGouramiSeriouslyFish.id,
]);
