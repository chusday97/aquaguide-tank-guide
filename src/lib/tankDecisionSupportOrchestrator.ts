import type { Aquarium, Fish } from '../types';
import { buildTankDecisionContext, type TankDecisionContext } from './tankDecisionContext';
import { buildConflictActionPlan, type ConflictActionPlan } from './conflictActionEngine';
import {
  buildInterventionChoiceComparison,
  type InterventionChoiceComparison,
} from './interventionChoiceModel';
import {
  evaluateRelocationDestinations,
  type RelocationDestinationResult,
} from './relocationDestinationEvaluator';
import { buildRelocationDestinationContext } from './relocationDestinationContext';

export type TankDecisionSupportCertainty = 'complete_known_community' | 'partial_known_community';

export type FormalInterventionBlockReason = 'unresolved_current_livestock';

export type TankDecisionDestinationEvaluation = {
  subjectSpeciesId: string;
  subjectName: string;
  quantity: number;
  destinations: RelocationDestinationResult;
};

export type TankDecisionSupportResult = {
  certainty: TankDecisionSupportCertainty;
  context: TankDecisionContext;
  knownSubsetActionPlan: ConflictActionPlan;
  knownSubsetChoiceComparison: InterventionChoiceComparison;
  formalInterventionAllowed: boolean;
  formalInterventionBlockReason?: FormalInterventionBlockReason;
  formalChoiceComparison: InterventionChoiceComparison | null;
  relocationDestinations: TankDecisionDestinationEvaluation[];
};

type TankDecisionSupportInput = {
  aquarium: Aquarium;
  catalog: Fish[];
  allAquariums?: Aquarium[];
};

const toResolvedInput = (context: TankDecisionContext) => context.resolvedLivestock.map(item => ({
  species: item.species,
  quantity: item.quantity,
}));

export const buildTankDecisionSupport = ({
  aquarium,
  catalog,
  allAquariums = [],
}: TankDecisionSupportInput): TankDecisionSupportResult => {
  const context = buildTankDecisionContext({ aquarium, catalog });
  const resolvedInput = toResolvedInput(context);
  const knownSubsetActionPlan = buildConflictActionPlan(resolvedInput);
  const knownSubsetChoiceComparison = buildInterventionChoiceComparison(resolvedInput);
  const hasUnresolvedCurrentLivestock = context.unresolvedCurrentSpeciesIds.length > 0;
  const certainty: TankDecisionSupportCertainty = hasUnresolvedCurrentLivestock
    ? 'partial_known_community'
    : 'complete_known_community';
  const formalInterventionAllowed = !hasUnresolvedCurrentLivestock;
  const formalChoiceComparison = formalInterventionAllowed
    ? knownSubsetChoiceComparison
    : null;

  // Destination evaluation is intentionally downstream of source-community
  // certainty. If source residents are unresolved, the product may still show
  // the known-subset graph for transparency, but it cannot promote a relocation
  // option or destination as a formal whole-tank intervention.
  const relocationDestinations: TankDecisionDestinationEvaluation[] = formalChoiceComparison
    ? formalChoiceComparison.options.map(option => {
        const subject = context.resolvedLivestock.find(item => item.species.id === option.subjectSpeciesId);
        if (!subject) throw new Error(`Missing resolved relocation subject ${option.subjectSpeciesId}`);
        const destinations = allAquariums.map(target => buildRelocationDestinationContext(target, catalog));
        return {
          subjectSpeciesId: subject.species.id,
          subjectName: subject.species.name,
          quantity: option.quantity,
          destinations: evaluateRelocationDestinations({
            relocatingSpecies: subject.species,
            quantity: option.quantity,
            sourceAquariumId: aquarium.id,
            destinations,
          }),
        };
      })
    : [];

  return {
    certainty,
    context,
    knownSubsetActionPlan,
    knownSubsetChoiceComparison,
    formalInterventionAllowed,
    formalInterventionBlockReason: hasUnresolvedCurrentLivestock
      ? 'unresolved_current_livestock'
      : undefined,
    formalChoiceComparison,
    relocationDestinations,
  };
};
