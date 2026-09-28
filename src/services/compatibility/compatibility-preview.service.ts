import type { Aquarium, Fish } from '../../types';
import { evaluateTankCompatibility, type TankCompatibilityStatus } from './compatibility.service';
import { getExactCatalogDuplicateCanonicalId } from '../../data/catalogDuplicateAliases';

type CurrentLivestock = Array<{ species: Fish; record: { quantity?: number } }>;

export const getCompatibilityPreviewSpecies = ({
  selectedAquarium,
  currentLivestock,
  activeSpeciesIds,
  preferredSpeciesIds,
  candidateSpecies,
  fallbackSpecies,
}: {
  selectedAquarium: Aquarium | null;
  currentLivestock: CurrentLivestock;
  activeSpeciesIds: string[];
  preferredSpeciesIds: string[];
  candidateSpecies: Fish[];
  fallbackSpecies: Fish[];
}) => {
  if (selectedAquarium) {
    // An empty tank is a real state. Do not turn it into an inferred
    // livestock/recommendation set; planning candidates must be user-selected.
    if (currentLivestock.length === 0) return [];

    const candidateById = new Map(candidateSpecies.map(fish => [fish.id, fish]));
    const ownedCanonicalIds = new Set(currentLivestock.map(item => getExactCatalogDuplicateCanonicalId(item.species.id)));
    const activeCanonicalIds = new Set(activeSpeciesIds.map(getExactCatalogDuplicateCanonicalId));
    const seenCandidateCanonicalIds = new Set<string>();
    const normalizedCandidates = candidateSpecies.flatMap(fish => {
      const canonicalId = getExactCatalogDuplicateCanonicalId(fish.id);
      if (seenCandidateCanonicalIds.has(canonicalId)) return [];
      seenCandidateCanonicalIds.add(canonicalId);
      const canonical = candidateById.get(canonicalId) || fish;
      return [canonical];
    });
    const evaluated = normalizedCandidates
      .filter(fish => !activeCanonicalIds.has(getExactCatalogDuplicateCanonicalId(fish.id)))
      .filter(fish => !ownedCanonicalIds.has(getExactCatalogDuplicateCanonicalId(fish.id)))
      .map(fish => ({
        fish,
        evaluation: evaluateTankCompatibility({
          tank: selectedAquarium,
          existingSpecies: currentLivestock,
          candidateSpecies: fish,
          candidateQuantity: 1,
        }),
      }))
      .filter(item => item.evaluation.status !== 'not_recommended')
      .sort((a, b) => {
        const rank: Record<TankCompatibilityStatus, number> = { compatible: 0, caution: 1, insufficient_data: 2, not_recommended: 3 };
        return rank[a.evaluation.status] - rank[b.evaluation.status] || a.fish.name.localeCompare(b.fish.name, 'zh-Hans-CN');
      })
      .map(item => item.fish)
      .slice(0, 8);
    if (evaluated.length > 0) return evaluated;
    return [];
  }

  const activeCanonicalIds = new Set(activeSpeciesIds.map(getExactCatalogDuplicateCanonicalId));
  const candidateById = new Map(candidateSpecies.map(fish => [fish.id, fish]));
  const dedupe = (items: Fish[]) => {
    const seen = new Set<string>();
    return items.flatMap(fish => {
      const canonicalId = getExactCatalogDuplicateCanonicalId(fish.id);
      if (seen.has(canonicalId) || activeCanonicalIds.has(canonicalId)) return [];
      seen.add(canonicalId);
      return [candidateById.get(canonicalId) || fish];
    });
  };
  const preferred = dedupe(Array.from(new Set(preferredSpeciesIds))
    .map(id => candidateSpecies.find(fish => fish.id === id))
    .filter((fish): fish is Fish => Boolean(fish)));
  return (preferred.length > 0 ? preferred : dedupe(fallbackSpecies)).slice(0, 8);
};
