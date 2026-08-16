import type { Aquarium, Fish } from '../types';
import {
  evaluateTankCompatibility,
  type TankCompatibilityResult,
} from './tankCompatibilityEngine';

export type RelocationDestinationStatus =
  | 'compatible_by_current_evidence'
  | 'conditional'
  | 'insufficient_data'
  | 'not_recommended';

export type RelocationDestinationContext = {
  aquarium: Aquarium;
  existingSpecies: Array<{
    species: Fish;
    quantity?: number;
  }>;
  unresolvedCurrentSpeciesIds?: string[];
};

export type RelocationDestinationEvaluation = {
  aquariumId: string;
  aquariumName: string;
  status: RelocationDestinationStatus;
  rawCompatibilityStatus: TankCompatibilityResult['status'];
  compatibility: TankCompatibilityResult;
  unresolvedCurrentSpeciesIds: string[];
  failClosedForUnresolvedResidents: boolean;
};

export type RelocationDestinationResult = {
  status: 'compatible_destination_found' | 'no_compatible_destination' | 'no_existing_destination';
  evaluations: RelocationDestinationEvaluation[];
  compatibleDestinationIds: string[];
  conditionalDestinationIds: string[];
  insufficientDataDestinationIds: string[];
  notRecommendedDestinationIds: string[];
  excludedSourceTankIds: string[];
};

type RelocationDestinationInput = {
  relocatingSpecies: Fish;
  quantity?: number;
  sourceAquariumId?: string;
  destinations: RelocationDestinationContext[];
};

const normalizeQuantity = (value?: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.max(1, Math.round(parsed)) : 1;
};

const classifyDestination = (
  compatibility: TankCompatibilityResult,
  unresolvedCurrentSpeciesIds: string[],
): { status: RelocationDestinationStatus; failClosedForUnresolvedResidents: boolean } => {
  if (compatibility.status === 'not_recommended') {
    return { status: 'not_recommended', failClosedForUnresolvedResidents: false };
  }
  if (unresolvedCurrentSpeciesIds.length > 0) {
    return { status: 'insufficient_data', failClosedForUnresolvedResidents: true };
  }
  if (compatibility.status === 'compatible') {
    return { status: 'compatible_by_current_evidence', failClosedForUnresolvedResidents: false };
  }
  if (compatibility.status === 'caution') {
    return { status: 'conditional', failClosedForUnresolvedResidents: false };
  }
  return { status: 'insufficient_data', failClosedForUnresolvedResidents: false };
};

export const evaluateRelocationDestinations = ({
  relocatingSpecies,
  quantity,
  sourceAquariumId,
  destinations,
}: RelocationDestinationInput): RelocationDestinationResult => {
  const excludedSourceTankIds: string[] = [];
  const evaluations = destinations.flatMap(destination => {
    if (sourceAquariumId && destination.aquarium.id === sourceAquariumId) {
      excludedSourceTankIds.push(destination.aquarium.id);
      return [];
    }

    const unresolvedCurrentSpeciesIds = Array.from(new Set(
      (destination.unresolvedCurrentSpeciesIds || []).filter(Boolean),
    )).sort();
    const compatibility = evaluateTankCompatibility({
      tank: destination.aquarium,
      existingSpecies: destination.existingSpecies.map(item => ({
        species: item.species,
        record: { quantity: normalizeQuantity(item.quantity) },
      })),
      candidateSpecies: relocatingSpecies,
      candidateQuantity: normalizeQuantity(quantity),
    });
    const classification = classifyDestination(compatibility, unresolvedCurrentSpeciesIds);

    return [{
      aquariumId: destination.aquarium.id,
      aquariumName: destination.aquarium.name,
      status: classification.status,
      rawCompatibilityStatus: compatibility.status,
      compatibility,
      unresolvedCurrentSpeciesIds,
      failClosedForUnresolvedResidents: classification.failClosedForUnresolvedResidents,
    } satisfies RelocationDestinationEvaluation];
  });

  const compatibleDestinationIds = evaluations
    .filter(item => item.status === 'compatible_by_current_evidence')
    .map(item => item.aquariumId)
    .sort();
  const conditionalDestinationIds = evaluations
    .filter(item => item.status === 'conditional')
    .map(item => item.aquariumId)
    .sort();
  const insufficientDataDestinationIds = evaluations
    .filter(item => item.status === 'insufficient_data')
    .map(item => item.aquariumId)
    .sort();
  const notRecommendedDestinationIds = evaluations
    .filter(item => item.status === 'not_recommended')
    .map(item => item.aquariumId)
    .sort();

  return {
    status: evaluations.length === 0
      ? 'no_existing_destination'
      : compatibleDestinationIds.length > 0
        ? 'compatible_destination_found'
        : 'no_compatible_destination',
    evaluations,
    compatibleDestinationIds,
    conditionalDestinationIds,
    insufficientDataDestinationIds,
    notRecommendedDestinationIds,
    excludedSourceTankIds: Array.from(new Set(excludedSourceTankIds)).sort(),
  };
};
