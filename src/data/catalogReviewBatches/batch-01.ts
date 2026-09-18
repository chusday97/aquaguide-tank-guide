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

/** GBIF taxonomy records were opened for identity only; they do not support aquarium husbandry fields. */
const verifiedIdentitySources: Record<string, string> = {
  'sp_0431': 'catalog-gbif-paracheirodon-innesi',
  'sp_0432': 'catalog-gbif-paracheirodon-axelrodi',
  'sp_0011': 'catalog-gbif-xiphophorus-maculatus',
  'sp_0437': 'catalog-gbif-poecilia-sphenops',
  'sp_0438': 'catalog-gbif-xiphophorus-hellerii',
};

const reviewedAt = '2026-08-31T00:00:00+08:00';

export const catalogReviewBatch01Sources: CatalogEvidenceSource[] = [
  {
    id: 'catalog-fishbase-paracheirodon-innesi',
    title: 'Paracheirodon innesi (Neon tetra) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Paracheirodon-innesi.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-fishbase-paracheirodon-axelrodi',
    title: 'Paracheirodon axelrodi (Cardinal tetra) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Paracheirodon-axelrodi.html',
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
    url: 'https://www.fishbase.se/summary/danio-rerio.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-fishbase-puntigrus-tetrazona',
    title: 'Puntigrus tetrazona (Tiger barb) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Puntius-tetrazona.html',
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
  {
    id: 'catalog-gbif-paracheirodon-innesi',
    title: 'Paracheirodon innesi GBIF Backbone Taxonomy record',
    publisher: 'GBIF Backbone Taxonomy',
    url: 'https://www.gbif.org/taxon/4CPDY',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-gbif-paracheirodon-axelrodi',
    title: 'Paracheirodon axelrodi GBIF species record',
    publisher: 'GBIF Backbone Taxonomy',
    url: 'https://www.gbif.org/species/307573227',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-gbif-xiphophorus-maculatus',
    title: 'Xiphophorus maculatus GBIF species record',
    publisher: 'GBIF Backbone Taxonomy',
    url: 'https://www.gbif.org/species/2350164',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-gbif-poecilia-sphenops',
    title: 'Poecilia sphenops GBIF species record',
    publisher: 'GBIF Backbone Taxonomy',
    url: 'https://www.gbif.org/species/5203748',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  {
    id: 'catalog-gbif-xiphophorus-hellerii',
    title: 'Xiphophorus hellerii GBIF species record',
    publisher: 'GBIF Backbone Taxonomy',
    url: 'https://www.gbif.org/species/8246728',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
];

const verifiedSourceIds = new Set([
  'catalog-fishbase-paracheirodon-innesi',
  'catalog-fishbase-paracheirodon-axelrodi',
  'catalog-fishbase-tanichthys-albonubes',
  'catalog-fishbase-poecilia-reticulata',
  'catalog-fishbase-danio-rerio',
  'catalog-fishbase-puntigrus-tetrazona',
]);

for (const sourceId of Object.values(verifiedIdentitySources)) verifiedSourceIds.add(sourceId);

const unknownReason = (field: string, sourceVerified: boolean) => sourceVerified
  ? `FishBase page was opened, but it did not provide accepted field-specific aquarium evidence for ${field}; the runtime value remains unknown.`
  : `The registered FishBase page could not be opened and verified in this review pass; aquarium ${field} remains unknown.`;

const makeReview = (
  speciesId: string,
  scientificName: string,
  citationId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  resolution: CatalogFieldReview['resolution'],
  sourceVerified = verifiedSourceIds.has(citationId),
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution,
  confidence: resolution === 'supported' ? 'high' : 'unknown',
  citationIds: [citationId],
  conflictNotes: resolution === 'unknown'
    ? [unknownReason(field, sourceVerified)]
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
    const sourceVerified = verifiedSourceIds.has(citationId);
    const identityCitationId = verifiedIdentitySources[speciesId] ?? citationId;
    if (field === 'identity' && verifiedSourceIds.has(identityCitationId)) {
      return makeReview(speciesId, scientificName, identityCitationId, field, {
        scientificName,
        baseSpeciesKey: scientificName,
        variantKey: null,
      }, 'supported');
    }
    if (field === 'water' && sourceVerified) {
      return makeReview(speciesId, scientificName, citationId, field, 'freshwater', 'supported');
    }
    return makeReview(speciesId, scientificName, citationId, field, null, 'unknown');
  }),
);

export const catalogReviewBatch01 = species.map(([speciesId]) => ({
  speciesId,
  sources: catalogReviewBatch01Sources.filter(source => {
    const item = species.find(entry => entry[0] === speciesId);
    return source.id === item?.[2] || source.id === verifiedIdentitySources[speciesId];
  }),
  fieldReviews: catalogReviewBatch01FieldReviews.filter(review => review.speciesId === speciesId),
}));

/** Populated only after a reviewer has read and verified source content. */
export const catalogReviewBatch01VerifiedSourceIds: string[] = [...verifiedSourceIds];
