import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-20T16:17:00+08:00';

export const variantEvidencePhase2_20Sources = {
  butterflyTailMasuko: {
    id: 'masukoap-red-butterfly-tail-territoriality-phase2-20',
    title: 'Red Butterfly Tail Goldfish care guide — temperament and tank mates',
    publisher: 'Aquarium Zukan / masukoap',
    url: 'https://masukoap.com/aquacrypt/%E8%B5%A4%E8%9D%B6%E5%B0%BE%E3%81%AE%E9%A3%BC%E3%81%84%E6%96%B9%E3%81%A8%E5%9B%B3%E9%91%91%E6%83%85%E5%A0%B1/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  redGrassMasuko: {
    id: 'masukoap-red-grass-guppy-territoriality-phase2-20',
    title: 'Red Grass Guppy care guide — temperament and tank mates',
    publisher: 'Aquarium Zukan / masukoap',
    url: 'https://masukoap.com/aquacrypt/%E3%83%AC%E3%83%83%E3%83%89%E3%82%B0%E3%83%A9%E3%82%B9%E3%82%B0%E3%83%83%E3%83%94%E3%83%BC%E3%81%AE%E9%A3%BC%E3%81%84%E6%96%B9%E3%81%A8%E5%9B%B3%E9%91%91%E6%83%85%E5%A0%B1/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

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

export const variantEvidencePhase2_20FieldReviews: CatalogFieldReview[] = [
  supported('sp_0065', 'territoriality', { traits: [] }, [variantEvidencePhase2_20Sources.butterflyTailMasuko.id], [
    'The exact Red Butterfly Tail variety guide explicitly states that the fish is generally peaceful and does not form strong territories toward its own kind. This is direct territoriality evidence; feeding competition and spawning chases are not promoted to persistent territoriality.',
  ]),
  supported('sp_0143', 'territoriality', { traits: [] }, [variantEvidencePhase2_20Sources.redGrassMasuko.id], [
    'The exact Red Grass Guppy strain guide explicitly states that males may lightly chase one another but are not strongly territorial. Courtship/chasing is kept separate from persistent territory defense.',
  ]),
];

export const variantEvidencePhase2_20VerifiedSourceIds = Object.values(variantEvidencePhase2_20Sources)
  .map(source => source.id);

export const variantEvidencePhase2_20ProfileIds = ['sp_0065', 'sp_0143'] as const;
