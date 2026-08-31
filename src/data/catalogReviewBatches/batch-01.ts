import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

/**
 * Batch 01 is deliberately conservative. FishBase is used as a traceable
 * identity/environment reference; fields that require aquarium-specific
 * husbandry evidence remain reviewed-unknown rather than being filled from
 * templates or memory.
 */
const species = [
  ['sp_0431', 'Paracheirodon innesi', 'catalog-fishbase-paracheirodon-innesi'],
  ['sp_0432', 'Paracheirodon axelrodi', 'catalog-fishbase-paracheirodon-axelrodi'],
  ['sp_0434', 'Tanichthys albonubes', 'catalog-fishbase-tanichthys-albonubes'],
  ['sp_0436', 'Poecilia reticulata', 'catalog-fishbase-poecilia-reticulata'],
  ['sp_0435', 'Danio rerio', 'catalog-fishbase-danio-rerio'],
  ['sp_0439', 'Puntigrus tetrazona', 'catalog-fishbase-puntigrus-tetrazona'],
  ['sp_0010', 'Gymnocorymbus ternetzi', 'catalog-fishbase-gymnocorymbus-ternetzi'],
  ['sp_0011', 'Xiphophorus maculatus', 'catalog-fishbase-xiphophorus-maculatus'],
  ['sp_0437', 'Poecilia sphenops', 'catalog-fishbase-poecilia-sphenops'],
  ['sp_0438', 'Xiphophorus hellerii', 'catalog-fishbase-xiphophorus-hellerii'],
] as const;

const reviewedAt = '2026-08-31T00:00:00+08:00';

export const catalogReviewBatch01Sources: CatalogEvidenceSource[] = [
  {
    id: 'catalog-fishbase-paracheirodon-innesi',
    title: 'Paracheirodon innesi (Neon tetra) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Paracheirodon-innesi.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-fishbase-paracheirodon-axelrodi',
    title: 'Paracheirodon axelrodi (Cardinal tetra) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Paracheirodon-axelrodi.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-fishbase-tanichthys-albonubes',
    title: 'Tanichthys albonubes (White cloud mountain minnow) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Tanichthys-albonubes.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-fishbase-poecilia-reticulata',
    title: 'Poecilia reticulata (Guppy) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Poecilia-reticulata.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-fishbase-danio-rerio',
    title: 'Danio rerio (Zebrafish) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Brachydanio_rerio.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-fishbase-puntigrus-tetrazona',
    title: 'Puntigrus tetrazona (Tiger barb) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Puntigrus_tetrazona.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-fishbase-gymnocorymbus-ternetzi',
    title: 'Gymnocorymbus ternetzi (Black tetra) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Gymnocorymbus-ternetzi',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-fishbase-xiphophorus-maculatus',
    title: 'Xiphophorus maculatus (Platy) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Xiphophorus_maculatus.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-fishbase-poecilia-sphenops',
    title: 'Poecilia sphenops (Molly) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/4680',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-fishbase-xiphophorus-hellerii',
    title: 'Xiphophorus hellerii (Green swordtail) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/Summary/Xiphophorus-hellerii',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
];

const unknownReason = (field: string) =>
  `FishBase identity/environment summary reviewed; no field-specific professional evidence was accepted for aquarium ${field}, so the runtime value remains unknown.`;

const makeReview = (
  speciesId: string,
  scientificName: string,
  citationId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  resolution: CatalogFieldReview['resolution'],
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution,
  confidence: resolution === 'supported' ? 'high' : 'unknown',
  citationIds: [citationId],
  conflictNotes: resolution === 'unknown'
    ? [unknownReason(field)]
    : [],
  reviewedAt,
});

const fields: CatalogFieldReview['field'][] = [
  'identity', 'water', 'temperature', 'ph', 'adult_size', 'tank_size',
  'social_behavior', 'territoriality', 'predation', 'breeding_behavior',
];

/** Exactly 100 field reviews: ten species by ten fields. */
export const catalogReviewBatch01FieldReviews: CatalogFieldReview[] = species.flatMap(
  ([speciesId, scientificName, citationId]) => fields.map(field => {
    if (field === 'identity') {
      return makeReview(speciesId, scientificName, citationId, field, {
        scientificName,
        baseSpeciesKey: scientificName,
        variantKey: null,
      }, 'supported');
    }
    if (field === 'water') {
      return makeReview(speciesId, scientificName, citationId, field, 'freshwater', 'supported');
    }
    return makeReview(speciesId, scientificName, citationId, field, null, 'unknown');
  }),
);

export const catalogReviewBatch01 = species.map(([speciesId]) => ({
  speciesId,
  sources: catalogReviewBatch01Sources.filter(source => source.id === species.find(item => item[0] === speciesId)?.[2]),
  fieldReviews: catalogReviewBatch01FieldReviews.filter(review => review.speciesId === speciesId),
}));

