import type { Aquarium, Fish } from '../../types';
import { evaluateTankCompatibility, type TankCompatibilityStatus } from './compatibility.service';

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

    const ownedIds = new Set(currentLivestock.map(item => item.species.id));
    const evaluated = candidateSpecies
      .filter(fish => !activeSpeciesIds.includes(fish.id))
      .filter(fish => !ownedIds.has(fish.id))
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

  const preferred = Array.from(new Set(preferredSpeciesIds))
    .map(id => candidateSpecies.find(fish => fish.id === id))
    .filter((fish): fish is Fish => Boolean(fish))
    .filter(fish => !activeSpeciesIds.includes(fish.id));
  return (preferred.length > 0 ? preferred : fallbackSpecies.filter(fish => !activeSpeciesIds.includes(fish.id))).slice(0, 8);
};
