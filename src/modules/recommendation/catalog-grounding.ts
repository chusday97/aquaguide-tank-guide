import type { Fish } from '../../types';

export type CatalogGroundingStatus = 'verified' | 'unresolved' | 'ambiguous';

export type CatalogSpeciesReference = {
  speciesId?: string | null;
  name?: string | null;
  scientificName?: string | null;
};

export type CatalogGroundingResult = {
  status: CatalogGroundingStatus;
  query: string;
  speciesId?: string;
  species?: Fish;
  matchedBy?: 'species_id' | 'name' | 'scientific_name';
  candidateSpeciesIds?: string[];
};

export type RecommendationGroundingResult = {
  verifiedSpeciesIds: string[];
  unresolvedSpeciesIds: string[];
};

const normalizeCatalogText = (value?: string | null) => (
  (value || '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ')
);

const uniqueSpecies = (items: Fish[]) => Array.from(
  new Map(items.map(item => [item.id, item])).values(),
);

const resolveUniqueMatch = (
  query: string,
  matchedBy: 'name' | 'scientific_name',
  matches: Fish[],
): CatalogGroundingResult => {
  const unique = uniqueSpecies(matches);
  if (unique.length === 1) {
    return {
      status: 'verified',
      query,
      speciesId: unique[0].id,
      species: unique[0],
      matchedBy,
    };
  }
  if (unique.length > 1) {
    return {
      status: 'ambiguous',
      query,
      matchedBy,
      candidateSpeciesIds: unique.map(item => item.id),
    };
  }
  return { status: 'unresolved', query };
};

/**
 * Resolve a human/user-facing species reference against AquaGuide's canonical catalog.
 *
 * Important contract:
 * - An explicit speciesId is strict. If the id does not exist in the provided canonical
 *   species pool, we do not silently fall back to a similar name.
 * - Name/scientific-name lookup only succeeds when it maps to one canonical record.
 * - Collisions stay ambiguous instead of choosing the first matching row.
 */
export const resolveCatalogSpecies = (
  reference: CatalogSpeciesReference,
  speciesPool: Fish[],
): CatalogGroundingResult => {
  const explicitId = (reference.speciesId || '').trim();
  if (explicitId) {
    const species = speciesPool.find(item => item.id === explicitId);
    if (!species) return { status: 'unresolved', query: explicitId };
    return {
      status: 'verified',
      query: explicitId,
      speciesId: species.id,
      species,
      matchedBy: 'species_id',
    };
  }

  const scientificName = normalizeCatalogText(reference.scientificName);
  if (scientificName) {
    return resolveUniqueMatch(
      reference.scientificName!.trim(),
      'scientific_name',
      speciesPool.filter(item => normalizeCatalogText(item.scientificName) === scientificName),
    );
  }

  const name = normalizeCatalogText(reference.name);
  if (name) {
    return resolveUniqueMatch(
      reference.name!.trim(),
      'name',
      speciesPool.filter(item => normalizeCatalogText(item.name) === name),
    );
  }

  return { status: 'unresolved', query: '' };
};

/**
 * Formal Recommendation Engine outputs are ID-grounded only. Generated names are not
 * enough to promote an item into a user-facing "recommended to add" result.
 */
export const groundRecommendationSpeciesIds = (
  speciesIds: string[],
  speciesPool: Fish[],
): RecommendationGroundingResult => {
  const canonicalIds = new Set(speciesPool.map(item => item.id));
  const verifiedSpeciesIds: string[] = [];
  const unresolvedSpeciesIds: string[] = [];

  Array.from(new Set(speciesIds.map(item => item.trim()).filter(Boolean))).forEach(speciesId => {
    if (canonicalIds.has(speciesId)) verifiedSpeciesIds.push(speciesId);
    else unresolvedSpeciesIds.push(speciesId);
  });

  return { verifiedSpeciesIds, unresolvedSpeciesIds };
};

export const isFormalRecommendationGrounded = (
  speciesId: string,
  speciesPool: Fish[],
) => groundRecommendationSpeciesIds([speciesId], speciesPool).unresolvedSpeciesIds.length === 0;
