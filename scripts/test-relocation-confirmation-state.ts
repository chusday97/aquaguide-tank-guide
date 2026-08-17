import assert from 'node:assert/strict';
import type { RelocationExecutionResult } from '../src/lib/relocationExecutionPolicy';
import {
  relocationOutcomeAllowsBlindMutationRetry,
  relocationOutcomeRequiresReconciliation,
  toRelocationConfirmationOutcome,
} from '../src/lib/relocationConfirmationState';

const asResult = (value: unknown) => value as RelocationExecutionResult;

const blocked = toRelocationConfirmationOutcome(asResult({
  status: 'blocked',
  reason: 'destination_not_compatible_by_current_evidence',
}));
assert.equal(blocked.phase, 'blocked');
assert.equal(blocked.executionStatus, 'blocked');
assert.equal(relocationOutcomeRequiresReconciliation(blocked), false);
assert.equal(relocationOutcomeAllowsBlindMutationRetry(blocked), false);

const completed = toRelocationConfirmationOutcome(asResult({
  status: 'executed',
  receipt: {},
  freshSourceDecision: {},
  freshDestinationEvaluation: {},
  postAquariums: [],
  postSourceDecision: {},
  postDestinationDecision: {},
}));
assert.equal(completed.phase, 'completed');
assert.equal(completed.executionStatus, 'executed');
assert.equal(relocationOutcomeRequiresReconciliation(completed), false);
assert.equal(relocationOutcomeAllowsBlindMutationRetry(completed), false);

const postStateUnavailable = toRelocationConfirmationOutcome(asResult({
  status: 'executed_post_state_unavailable',
  receipt: {},
  freshSourceDecision: {},
  freshDestinationEvaluation: {},
  errorMessage: 'reload failed',
}));
assert.equal(postStateUnavailable.phase, 'reconcile_required');
assert.equal(postStateUnavailable.executionStatus, 'executed_post_state_unavailable');
assert.equal(relocationOutcomeRequiresReconciliation(postStateUnavailable), true);
assert.equal(relocationOutcomeAllowsBlindMutationRetry(postStateUnavailable), false);

const mutationUnknown = toRelocationConfirmationOutcome(asResult({
  status: 'mutation_state_unknown',
  operationId: 'same-idempotency-operation',
  freshSourceDecision: {},
  freshDestinationEvaluation: {},
  errorMessage: 'transport disconnected',
}));
assert.equal(mutationUnknown.phase, 'reconcile_required');
assert.equal(mutationUnknown.executionStatus, 'mutation_state_unknown');
assert.equal(relocationOutcomeRequiresReconciliation(mutationUnknown), true);
assert.equal(relocationOutcomeAllowsBlindMutationRetry(mutationUnknown), false);

console.log('relocation confirmation state passed: blocked/completed/uncertain outcomes remain distinct and no terminal outcome authorizes a blind mutation retry');
