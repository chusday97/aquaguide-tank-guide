import type { Aquarium, Fish } from '../types';
import type { RelocationDestinationEvaluation } from './relocationDestinationEvaluator';
import {
  buildTankDecisionSupport,
  type TankDecisionSupportResult,
} from './tankDecisionSupportOrchestrator';

export type RelocationExecutionRequest = {
  sourceAquariumId: string;
  sourceAquariumFishId: string;
  sourceBatchId: string;
  destinationAquariumId: string;
  quantity: number;
  operationId: string;
};

// The decision layer needs only an acknowledgement that the mutation callback
// resolved. Canonical source/destination state is deliberately reloaded after
// the mutation instead of being trusted from a write response.
export type RelocationMutationReceipt = {
  replayed?: boolean;
};

export type RelocationExecutionBlockReason =
  | 'invalid_quantity'
  | 'same_aquarium'
  | 'source_aquarium_not_found'
  | 'destination_aquarium_not_found'
  | 'source_livestock_not_found'
  | 'source_livestock_unresolved'
  | 'source_batch_not_found'
  | 'source_batch_quantity_changed'
  | 'source_species_not_grounded'
  | 'source_intervention_not_formally_allowed'
  | 'source_subject_no_longer_formal_relocation_option'
  | 'requested_quantity_not_fresh_formal_option'
  | 'destination_not_evaluated'
  | 'destination_not_compatible_by_current_evidence';

export type RelocationExecutionBlockedResult = {
  status: 'blocked';
  reason: RelocationExecutionBlockReason;
  freshSourceDecision?: TankDecisionSupportResult;
  freshDestinationEvaluation?: RelocationDestinationEvaluation;
};

export type RelocationExecutionCompletedResult = {
  status: 'executed';
  receipt: RelocationMutationReceipt;
  freshSourceDecision: TankDecisionSupportResult;
  freshDestinationEvaluation: RelocationDestinationEvaluation;
  postAquariums: Aquarium[];
  postSourceDecision: TankDecisionSupportResult;
  postDestinationDecision: TankDecisionSupportResult;
};

export type RelocationExecutionPostStateUnavailableResult = {
  status: 'executed_post_state_unavailable';
  receipt: RelocationMutationReceipt;
  freshSourceDecision: TankDecisionSupportResult;
  freshDestinationEvaluation: RelocationDestinationEvaluation;
  errorMessage: string;
};

export type RelocationExecutionMutationStateUnknownResult = {
  status: 'mutation_state_unknown';
  operationId: string;
  freshSourceDecision: TankDecisionSupportResult;
  freshDestinationEvaluation: RelocationDestinationEvaluation;
  errorMessage: string;
};

export type RelocationExecutionResult =
  | RelocationExecutionBlockedResult
  | RelocationExecutionCompletedResult
  | RelocationExecutionPostStateUnavailableResult
  | RelocationExecutionMutationStateUnknownResult;

type RelocationMutation = (request: RelocationExecutionRequest) => Promise<RelocationMutationReceipt>;

type RelocationExecutionPolicyInput = {
  request: RelocationExecutionRequest;
  catalog: Fish[];
  loadAquariums: () => Promise<Aquarium[]>;
  relocate: RelocationMutation;
};

const isUnresolvedRecord = (fishId: string) => fishId.startsWith('unresolved:');

const block = (
  reason: RelocationExecutionBlockReason,
  freshSourceDecision?: TankDecisionSupportResult,
  freshDestinationEvaluation?: RelocationDestinationEvaluation,
): RelocationExecutionBlockedResult => ({
  status: 'blocked',
  reason,
  freshSourceDecision,
  freshDestinationEvaluation,
});

export const executeFreshRelocation = async ({
  request,
  catalog,
  loadAquariums,
  relocate,
}: RelocationExecutionPolicyInput): Promise<RelocationExecutionResult> => {
  if (!Number.isInteger(request.quantity) || request.quantity < 1) {
    return block('invalid_quantity');
  }
  if (request.sourceAquariumId === request.destinationAquariumId) {
    return block('same_aquarium');
  }

  // Never trust a verdict captured by the UI. Every execution starts from a
  // fresh canonical aquarium snapshot and rebuilds the source decision tree.
  const freshAquariums = await loadAquariums();
  const sourceAquarium = freshAquariums.find(item => item.id === request.sourceAquariumId);
  if (!sourceAquarium) return block('source_aquarium_not_found');
  const destinationAquarium = freshAquariums.find(item => item.id === request.destinationAquariumId);
  if (!destinationAquarium) return block('destination_aquarium_not_found');

  const sourceRecord = sourceAquarium.fishes.find(item => item.id === request.sourceAquariumFishId);
  if (!sourceRecord) return block('source_livestock_not_found');
  if (isUnresolvedRecord(String(sourceRecord.fishId || ''))) {
    return block('source_livestock_unresolved');
  }

  const sourceBatch = sourceRecord.batches?.find(item => item.id === request.sourceBatchId);
  if (!sourceBatch) return block('source_batch_not_found');
  if (request.quantity > sourceBatch.quantity) return block('source_batch_quantity_changed');

  const freshSourceDecision = buildTankDecisionSupport({
    aquarium: sourceAquarium,
    catalog,
    allAquariums: freshAquariums,
  });
  const resolvedSubject = freshSourceDecision.context.resolvedLivestock.find(item => (
    item.sourceRecordIds.includes(request.sourceAquariumFishId)
  ));
  if (!resolvedSubject) {
    return block('source_species_not_grounded', freshSourceDecision);
  }
  if (!freshSourceDecision.formalInterventionAllowed || !freshSourceDecision.formalChoiceComparison) {
    return block('source_intervention_not_formally_allowed', freshSourceDecision);
  }

  const freshChoice = freshSourceDecision.formalChoiceComparison.options.find(item => (
    item.subjectSpeciesId === resolvedSubject.species.id
  ));
  if (!freshChoice) {
    return block('source_subject_no_longer_formal_relocation_option', freshSourceDecision);
  }

  // Current intervention semantics model relocation as removing the complete
  // formal subject. A single-batch mutation may execute only when that exact
  // fresh option quantity fits the selected batch. Partial moves must not be
  // presented as if they resolved a whole-community blocker.
  if (request.quantity !== freshChoice.quantity) {
    return block('requested_quantity_not_fresh_formal_option', freshSourceDecision);
  }

  const destinationSet = freshSourceDecision.relocationDestinations.find(item => (
    item.subjectSpeciesId === resolvedSubject.species.id
  ));
  const freshDestinationEvaluation = destinationSet?.destinations.evaluations.find(item => (
    item.aquariumId === request.destinationAquariumId
  ));
  if (!freshDestinationEvaluation) {
    return block('destination_not_evaluated', freshSourceDecision);
  }
  if (freshDestinationEvaluation.status !== 'compatible_by_current_evidence') {
    return block(
      'destination_not_compatible_by_current_evidence',
      freshSourceDecision,
      freshDestinationEvaluation,
    );
  }

  // A rejected network/API promise cannot prove that the database did not
  // commit. Preserve the same operation ID and force reconciliation before any
  // later retry; never translate an ambiguous transport failure into “not moved”.
  let receipt: RelocationMutationReceipt;
  try {
    receipt = await relocate(request);
  } catch (error) {
    return {
      status: 'mutation_state_unknown',
      operationId: request.operationId,
      freshSourceDecision,
      freshDestinationEvaluation,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  try {
    const postAquariums = await loadAquariums();
    const postSourceAquarium = postAquariums.find(item => item.id === request.sourceAquariumId);
    const postDestinationAquarium = postAquariums.find(item => item.id === request.destinationAquariumId);
    if (!postSourceAquarium || !postDestinationAquarium) {
      throw new Error('post-relocation canonical aquarium state is incomplete');
    }
    const postSourceDecision = buildTankDecisionSupport({
      aquarium: postSourceAquarium,
      catalog,
      allAquariums: postAquariums,
    });
    const postDestinationDecision = buildTankDecisionSupport({
      aquarium: postDestinationAquarium,
      catalog,
      allAquariums: postAquariums,
    });
    return {
      status: 'executed',
      receipt,
      freshSourceDecision,
      freshDestinationEvaluation,
      postAquariums,
      postSourceDecision,
      postDestinationDecision,
    };
  } catch (error) {
    return {
      status: 'executed_post_state_unavailable',
      receipt,
      freshSourceDecision,
      freshDestinationEvaluation,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
};
