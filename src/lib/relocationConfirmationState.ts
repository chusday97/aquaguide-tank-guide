import type {
  RelocationExecutionBlockReason,
  RelocationExecutionResult,
} from './relocationExecutionPolicy';

export type RelocationConfirmationPhase =
  | 'idle'
  | 'checking'
  | 'blocked'
  | 'completed'
  | 'reconcile_required';

export type RelocationConfirmationOutcome =
  | {
      phase: 'blocked';
      reason: RelocationExecutionBlockReason;
      executionStatus: 'blocked';
    }
  | {
      phase: 'completed';
      executionStatus: 'executed';
    }
  | {
      phase: 'reconcile_required';
      executionStatus: 'executed_post_state_unavailable' | 'mutation_state_unknown';
    };

export const toRelocationConfirmationOutcome = (
  result: RelocationExecutionResult,
): RelocationConfirmationOutcome => {
  if (result.status === 'blocked') {
    return {
      phase: 'blocked',
      reason: result.reason,
      executionStatus: 'blocked',
    };
  }
  if (result.status === 'executed') {
    return {
      phase: 'completed',
      executionStatus: 'executed',
    };
  }
  return {
    phase: 'reconcile_required',
    executionStatus: result.status,
  };
};

export const relocationOutcomeRequiresReconciliation = (
  outcome: RelocationConfirmationOutcome,
) => outcome.phase === 'reconcile_required';

// Confirmation UI never blindly retries a mutation from a terminal outcome.
// A blocked case needs a newly evaluated proposal; a completed case is done;
// an uncertain case must reconcile canonical state first.
export const relocationOutcomeAllowsBlindMutationRetry = (
  _outcome: RelocationConfirmationOutcome,
) => false;
