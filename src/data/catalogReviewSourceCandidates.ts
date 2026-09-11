import type { CatalogEvidenceSource } from '../../packages/contracts/src';

/**
 * Curated starting points for the first review batch.
 *
 * These records deliberately remain `draft`: a source page is not proof that
 * every field on a SpeciesProfile is supported. A reviewer must inspect the
 * page, select the fields it actually supports, and mark the citation as
 * reviewed before it can enter the runtime Catalog.
 */
const firstBatchFishBaseSources: Record<string, CatalogEvidenceSource> = {
  sp_0431: {
    id: 'catalog-fishbase-paracheirodon-innesi',
    title: 'Paracheirodon innesi (Neon tetra) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Paracheirodon-innesi.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'draft',
  },
  sp_0432: {
    id: 'catalog-fishbase-paracheirodon-axelrodi',
    title: 'Paracheirodon axelrodi (Cardinal tetra) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Paracheirodon-axelrodi.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'draft',
  },
  sp_0434: {
    id: 'catalog-fishbase-tanichthys-albonubes',
    title: 'Tanichthys albonubes (White cloud mountain minnow) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Tanichthys-albonubes.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'draft',
  },
  sp_0436: {
    id: 'catalog-fishbase-poecilia-reticulata',
    title: 'Poecilia reticulata (Guppy) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Poecilia-reticulata.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'draft',
  },
  sp_0435: {
    id: 'catalog-fishbase-danio-rerio',
    title: 'Danio rerio (Zebrafish) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Brachydanio_rerio.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'draft',
  },
  sp_0439: {
    id: 'catalog-fishbase-puntigrus-tetrazona',
    title: 'Puntigrus tetrazona (Tiger barb) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Puntigrus_tetrazona.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'draft',
  },
  sp_0010: {
    id: 'catalog-fishbase-gymnocorymbus-ternetzi',
    title: 'Gymnocorymbus ternetzi (Black tetra) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Gymnocorymbus-ternetzi',
    sourceType: 'curated_husbandry',
    reviewStatus: 'draft',
  },
  sp_0011: {
    id: 'catalog-fishbase-xiphophorus-maculatus',
    title: 'Xiphophorus maculatus (Platy) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Xiphophorus_maculatus.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'draft',
  },
  sp_0437: {
    id: 'catalog-fishbase-poecilia-sphenops',
    title: 'Poecilia sphenops (Molly) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/4680',
    sourceType: 'curated_husbandry',
    reviewStatus: 'draft',
  },
  sp_0438: {
    id: 'catalog-fishbase-xiphophorus-hellerii',
    title: 'Xiphophorus hellerii (Green swordtail) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/Summary/Xiphophorus-hellerii',
    sourceType: 'curated_husbandry',
    reviewStatus: 'draft',
  },
};

export const getCatalogReviewSourceCandidates = (speciesId: string): CatalogEvidenceSource[] => {
  const source = firstBatchFishBaseSources[speciesId];
  return source ? [source] : [];
};

export const catalogReviewSourceCandidateIds = Object.values(firstBatchFishBaseSources)
  .map(source => source.id);
