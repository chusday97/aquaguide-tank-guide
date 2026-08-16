import type { Fish } from '../types';
import {
  buildConflictActionPlan,
  type ConflictActionPlan,
  type RelocationActionOption,
} from './conflictActionEngine';

export type InterventionChoiceKind =
  | 'no_blocking_conflict'
  | 'unique_strongest_single_change'
  | 'multiple_equal_single_change_options'
  | 'blocking_conflict_without_verified_single_change';

export type InterventionChoiceOption = {
  id: string;
  action: 'relocate_species';
  subjectSpeciesId: string;
  subjectName: string;
  quantity: number;
  resolvesBlockerCount: number;
  remainingBlockerCount: number;
  resolvesConflictCount: number;
  remainingConflictCount: number;
  warningReduction: number;
  evidenceGapReduction: number;
  strongestSingleChange: boolean;
  evidenceMode: RelocationActionOption['evidenceMode'];
  resolvedBlockerIds: string[];
  remainingBlockerIds: string[];
};

export type InterventionChoiceComparison = {
  decisionMode: 'user_choice_required';
  kind: InterventionChoiceKind;
  actionPlan: ConflictActionPlan;
  options: InterventionChoiceOption[];
  strongestOptionIds: string[];
  summary: {
    baselineBlockerCount: number;
    bestSingleChangeBlockerReduction: number;
    optionCount: number;
    tie: boolean;
  };
};

type InterventionChoiceInput = Array<{
  species: Fish;
  quantity?: number;
}>;

const toChoiceOption = (option: RelocationActionOption): InterventionChoiceOption => ({
  id: option.id,
  action: 'relocate_species',
  subjectSpeciesId: option.subjectSpeciesIds[0],
  subjectName: option.subjectName,
  quantity: option.quantity,
  resolvesBlockerCount: option.resolvesBlockerIds.length,
  remainingBlockerCount: option.remainingBlockerIds.length,
  resolvesConflictCount: option.resolvesConflictIds.length,
  remainingConflictCount: option.scenario.remainingConflictIds.length,
  warningReduction: option.warningReduction,
  evidenceGapReduction: option.evidenceGapReduction,
  strongestSingleChange: option.strongestSingleChange,
  evidenceMode: option.evidenceMode,
  resolvedBlockerIds: [...option.resolvesBlockerIds],
  remainingBlockerIds: [...option.remainingBlockerIds],
});

export const buildInterventionChoiceComparison = (
  input: InterventionChoiceInput,
): InterventionChoiceComparison => {
  const actionPlan = buildConflictActionPlan(input);
  const options = actionPlan.relocationOptions.map(toChoiceOption);
  const strongestOptionIds = options
    .filter(option => option.strongestSingleChange)
    .map(option => option.id)
    .sort();
  const baselineBlockerCount = actionPlan.graph.summary.blockerCount;
  const bestSingleChangeBlockerReduction = actionPlan.intervention.summary.bestSingleSpeciesBlockerReduction;

  let kind: InterventionChoiceKind;
  if (baselineBlockerCount === 0) {
    kind = 'no_blocking_conflict';
  } else if (strongestOptionIds.length === 1) {
    kind = 'unique_strongest_single_change';
  } else if (strongestOptionIds.length > 1) {
    kind = 'multiple_equal_single_change_options';
  } else {
    kind = 'blocking_conflict_without_verified_single_change';
  }

  return {
    decisionMode: 'user_choice_required',
    kind,
    actionPlan,
    options,
    strongestOptionIds,
    summary: {
      baselineBlockerCount,
      bestSingleChangeBlockerReduction,
      optionCount: options.length,
      tie: strongestOptionIds.length > 1,
    },
  };
};
