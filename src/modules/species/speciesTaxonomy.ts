import type { Fish } from '../../types';

/**
 * Returns the biological base-species key (Genus species) when a scientific
 * name is structured enough to support it. Morph / var. suffixes intentionally
 * collapse to the same base taxon; unknown names fall back to exact catalog ID.
 */
export const getBaseSpeciesScientificName = (scientificName?: string | null) => {
  const match = scientificName?.trim().match(/^([A-Z][A-Za-z-]+)\s+([a-z][A-Za-z-]+)/);
  return match ? `${match[1]} ${match[2]}` : null;
};

export const getCanonicalSpeciesTaxonKey = (fish: Pick<Fish, 'id' | 'scientificName'>) => (
  getBaseSpeciesScientificName(fish.scientificName) || `catalog:${fish.id}`
);
