import { fishData } from '../../data/fishData';
import { deriveSpeciesGroups, findGroupForSpecies, type SpeciesGroup } from '../../lib/speciesGrouping';
import type { Fish } from '../../types';

// The local catalog contains a duplicated Red Neocaridina row. It remains available
// to legacy flows, but must not create a second public Variant card.
const PUBLIC_VARIANT_EXCLUSIONS = new Set(['sp_0027']);

export const publicSpeciesCatalog = fishData.filter(fish => !PUBLIC_VARIANT_EXCLUSIONS.has(fish.id));

export type SpeciesLandingSelection = {
  species: Fish;
  baseSpecies: Fish;
  group: SpeciesGroup | null;
  variants: Fish[];
};

const byId = new Map(publicSpeciesCatalog.map(fish => [fish.id, fish]));

export const speciesLandingGroups = deriveSpeciesGroups(publicSpeciesCatalog);

export const getSpeciesLandingSelection = (slug: string, variantId?: string | null): SpeciesLandingSelection | null => {
  const routeSpecies = byId.get(slug);
  if (!routeSpecies) return null;
  const group = findGroupForSpecies(routeSpecies.id, speciesLandingGroups);
  const variants = group?.variants || [routeSpecies];
  const requestedVariant = variantId ? variants.find(fish => fish.id === variantId) : undefined;
  const species = requestedVariant || routeSpecies;
  return {
    species,
    baseSpecies: group?.representativeSpecies || routeSpecies,
    group,
    variants,
  };
};

export const getSpeciesLandingById = (id: string) => byId.get(id) || null;
