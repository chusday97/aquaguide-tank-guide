import type { Aquarium } from '../../types';
import { buildTankContext, type TankContextOverrides } from './buildTankContext';
import { buildEnvironmentDecision } from './environmentDecisionEngine';
import {
  getReviewedPlantEnvironmentProfile,
  getReviewedSpeciesEnvironmentProfile,
} from './environmentProfileRegistry';
import type { EnvironmentDecision, TankContext } from './environment.types';

export type ReviewedEnvironmentDecisionResult =
  | {
      status: 'ready';
      speciesId: string;
      plantSpeciesId?: string;
      tank: TankContext;
      decision: EnvironmentDecision;
    }
  | {
      status: 'missing_species_profile';
      speciesId: string;
      plantSpeciesId?: string;
    }
  | {
      status: 'missing_plant_profile';
      speciesId: string;
      plantSpeciesId: string;
    };

export type BuildReviewedEnvironmentDecisionInput = {
  speciesId: string;
  aquarium: Aquarium;
  overrides?: TankContextOverrides;
  plantSpeciesId?: string;
};

/**
 * Production boundary for Environment Decision V1.
 *
 * Only audit-clean reviewed profiles are allowed to reach the deterministic
 * engine. Missing species/plant knowledge is returned explicitly rather than
 * being filled from fishData prose, regex classifications, generic templates,
 * or an LLM.
 */
export const buildReviewedEnvironmentDecision = ({
  speciesId,
  aquarium,
  overrides = {},
  plantSpeciesId,
}: BuildReviewedEnvironmentDecisionInput): ReviewedEnvironmentDecisionResult => {
  const species = getReviewedSpeciesEnvironmentProfile(speciesId);
  if (!species) {
    return {
      status: 'missing_species_profile',
      speciesId,
      plantSpeciesId,
    };
  }

  const plant = plantSpeciesId
    ? getReviewedPlantEnvironmentProfile(plantSpeciesId)
    : undefined;

  if (plantSpeciesId && !plant) {
    return {
      status: 'missing_plant_profile',
      speciesId,
      plantSpeciesId,
    };
  }

  const tank = buildTankContext(aquarium, overrides);
  return {
    status: 'ready',
    speciesId,
    plantSpeciesId,
    tank,
    decision: buildEnvironmentDecision({
      species,
      tank,
      plant,
    }),
  };
};
