import type { Aquarium } from '../types';
import type { TankDecisionSupportResult } from './tankDecisionSupportOrchestrator';

export type RelocationConfirmationEntrypointBlockReason =
  | 'formal_intervention_not_allowed'
  | 'formal_option_not_found'
  | 'source_aquarium_mismatch'
  | 'resolved_subject_not_found'
  | 'multiple_source_records'
  | 'source_record_not_found'
  | 'source_record_quantity_mismatch'
  | 'source_batch_missing'
  | 'multiple_positive_source_batches'
  | 'source_batch_quantity_mismatch'
  | 'destination_not_in_formal_result'
  | 'destination_not_compatible_by_current_evidence';

export type RelocationConfirmationLaunchCandidate = {
  sourceAquariumId: string;
  sourceAquariumName: string;
  sourceAquariumFishId: string;
  sourceBatchId: string;
  destinationAquariumId: string;
  destinationAquariumName: string;
  subjectSpeciesId: string;
  speciesName: string;
  quantity: number;
};

export type RelocationConfirmationEntrypointResult =
  | {
      status: 'eligible';
      candidate: RelocationConfirmationLaunchCandidate;
    }
  | {
      status: 'blocked';
      reason: RelocationConfirmationEntrypointBlockReason;
    };

type BuildRelocationConfirmationEntrypointInput = {
  result: TankDecisionSupportResult;
  sourceAquarium: Aquarium;
  optionId: string;
  destinationAquariumId: string;
};

const block = (
  reason: RelocationConfirmationEntrypointBlockReason,
): RelocationConfirmationEntrypointResult => ({ status: 'blocked', reason });

/**
 * Converts a read-only formal relocation card into a confirmation-launch
 * candidate. This is deliberately NOT mutation authorization: no cached safety
 * boolean/verdict and no operationId are emitted. PR #63 must still reload and
 * recompute the source/destination immediately before any mutation.
 *
 * Current mutation v1 addresses one factual source record + one explicit batch,
 * while the intervention model is whole-canonical-species. Therefore this
 * entrypoint fails closed unless the whole formal subject maps losslessly to one
 * factual record and one positive batch with the exact same quantity.
 */
export const buildRelocationConfirmationEntrypoint = ({
  result,
  sourceAquarium,
  optionId,
  destinationAquariumId,
}: BuildRelocationConfirmationEntrypointInput): RelocationConfirmationEntrypointResult => {
  if (!result.formalInterventionAllowed || !result.formalChoiceComparison) {
    return block('formal_intervention_not_allowed');
  }

  const option = result.formalChoiceComparison.options.find(item => item.id === optionId);
  if (!option) return block('formal_option_not_found');

  if (sourceAquarium.id !== result.context.aquariumId) {
    return block('source_aquarium_mismatch');
  }

  const resolvedSubject = result.context.resolvedLivestock.find(item => (
    item.species.id === option.subjectSpeciesId
  ));
  if (!resolvedSubject) return block('resolved_subject_not_found');

  // Do not collapse a species-level option onto an arbitrary factual record.
  if (resolvedSubject.sourceRecordIds.length !== 1) {
    return block('multiple_source_records');
  }

  const sourceRecordId = resolvedSubject.sourceRecordIds[0];
  const sourceRecord = sourceAquarium.fishes.find(item => item.id === sourceRecordId);
  if (!sourceRecord) return block('source_record_not_found');

  if (sourceRecord.quantity !== option.quantity || resolvedSubject.quantity !== option.quantity) {
    return block('source_record_quantity_mismatch');
  }

  const positiveBatches = (sourceRecord.batches || []).filter(batch => (
    Number.isInteger(batch.quantity) && batch.quantity > 0
  ));
  if (positiveBatches.length === 0) return block('source_batch_missing');

  // A whole-subject option cannot be represented by selecting the first of
  // several batches. Partial moves need their own counterfactual model later.
  if (positiveBatches.length !== 1) {
    return block('multiple_positive_source_batches');
  }

  const sourceBatch = positiveBatches[0];
  if (sourceBatch.quantity !== option.quantity) {
    return block('source_batch_quantity_mismatch');
  }

  const destinationSet = result.relocationDestinations.find(item => (
    item.subjectSpeciesId === option.subjectSpeciesId
  ));
  const destination = destinationSet?.destinations.evaluations.find(item => (
    item.aquariumId === destinationAquariumId
  ));
  if (!destination) return block('destination_not_in_formal_result');

  // This status only controls whether it is useful to OPEN confirmation. It is
  // intentionally not copied into the candidate as execution authorization.
  if (destination.status !== 'compatible_by_current_evidence') {
    return block('destination_not_compatible_by_current_evidence');
  }

  return {
    status: 'eligible',
    candidate: {
      sourceAquariumId: sourceAquarium.id,
      sourceAquariumName: sourceAquarium.name,
      sourceAquariumFishId: sourceRecord.id,
      sourceBatchId: sourceBatch.id,
      destinationAquariumId: destination.aquariumId,
      destinationAquariumName: destination.aquariumName,
      subjectSpeciesId: option.subjectSpeciesId,
      speciesName: option.subjectName,
      quantity: option.quantity,
    },
  };
};
