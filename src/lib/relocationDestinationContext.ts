import type { Aquarium, Fish } from '../types';
import type { RelocationDestinationContext } from './relocationDestinationEvaluator';
import { buildTankDecisionContext } from './tankDecisionContext';

export const buildRelocationDestinationContext = (
  aquarium: Aquarium,
  catalog: Fish[],
): RelocationDestinationContext => {
  const context = buildTankDecisionContext({ aquarium, catalog });
  return {
    aquarium,
    existingSpecies: context.resolvedLivestock.map(item => ({
      species: item.species,
      quantity: item.quantity,
    })),
    unresolvedCurrentSpeciesIds: context.unresolvedCurrentSpeciesIds,
  };
};
