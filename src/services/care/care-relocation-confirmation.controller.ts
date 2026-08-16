import type { Fish } from '../../types';
import type { RelocationConfirmationFacts } from '../../components/compatibility/RelocationConfirmationDialog';
import type { RelocationConfirmationLaunchCandidate } from '../../lib/relocationConfirmationEntrypoint';
import {
  executeFreshRelocation,
  type RelocationExecutionRequest,
  type RelocationExecutionResult,
} from '../../lib/relocationExecutionPolicy';
import type { AquaGuideRepository } from '../repository/aquaguide.repository';

export type CareRelocationConfirmationAttempt = {
  operationId: string;
  request: RelocationExecutionRequest;
  facts: RelocationConfirmationFacts;
  intentKey: string;
};

type CareRelocationConfirmationControllerInput = {
  candidate: RelocationConfirmationLaunchCandidate;
  catalog: Fish[];
  getRepository: () => Promise<AquaGuideRepository>;
  createOperationId?: () => string;
};

export type CareRelocationConfirmationController = {
  attempt: CareRelocationConfirmationAttempt;
  execute: () => Promise<RelocationExecutionResult>;
  reconcile: () => ReturnType<AquaGuideRepository['getAquariums']>;
};

const defaultOperationId = () => {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `care-relocation:${random}`;
};

const buildIntentKey = (candidate: RelocationConfirmationLaunchCandidate) => [
  candidate.sourceAquariumId,
  candidate.sourceAquariumFishId,
  candidate.sourceBatchId,
  candidate.destinationAquariumId,
  candidate.quantity,
].join(':');

/**
 * Creates one executable confirmation attempt from one already-gated #65 launch
 * candidate. Call this from the user's "open confirmation" event, never during
 * render. The generated operationId and repository session are stable for the
 * lifetime of this controller.
 *
 * Repository mode is resolved lazily exactly once for a successful resolution
 * and the same repository instance owns pre-load, mutation, post-load and any
 * later reconciliation reads. This prevents one attempt from crossing cloud /
 * local truth sources if auth state changes mid-flight.
 */
export const createCareRelocationConfirmationController = ({
  candidate,
  catalog,
  getRepository,
  createOperationId = defaultOperationId,
}: CareRelocationConfirmationControllerInput): CareRelocationConfirmationController => {
  const operationId = createOperationId();
  const request: RelocationExecutionRequest = {
    sourceAquariumId: candidate.sourceAquariumId,
    sourceAquariumFishId: candidate.sourceAquariumFishId,
    sourceBatchId: candidate.sourceBatchId,
    destinationAquariumId: candidate.destinationAquariumId,
    quantity: candidate.quantity,
    operationId,
  };
  const facts: RelocationConfirmationFacts = {
    sourceAquariumName: candidate.sourceAquariumName,
    destinationAquariumName: candidate.destinationAquariumName,
    speciesName: candidate.speciesName,
  };
  const attempt: CareRelocationConfirmationAttempt = {
    operationId,
    request,
    facts,
    intentKey: buildIntentKey(candidate),
  };

  let repositoryPromise: Promise<AquaGuideRepository> | null = null;
  let executionPromise: Promise<RelocationExecutionResult> | null = null;

  const resolveRepository = () => {
    if (!repositoryPromise) {
      repositoryPromise = getRepository().catch(error => {
        // A repository that never resolved cannot have been used to mutate.
        // Allow a later reconciliation/read attempt to resolve the mode again.
        repositoryPromise = null;
        throw error;
      });
    }
    return repositoryPromise;
  };

  const loadAquariums = async () => {
    const repository = await resolveRepository();
    return repository.getAquariums();
  };

  const relocate = async (relocationRequest: RelocationExecutionRequest) => {
    const repository = await resolveRepository();
    const receipt = await repository.relocateLivestock(relocationRequest);
    return { replayed: receipt.replayed };
  };

  const execute = () => {
    // One controller is one confirmation attempt. Double clicks / repeated
    // callbacks return the same execution instead of issuing another mutation.
    if (!executionPromise) {
      executionPromise = executeFreshRelocation({
        request,
        catalog,
        loadAquariums,
        relocate,
      });
    }
    return executionPromise;
  };

  const reconcile = () => loadAquariums();

  return { attempt, execute, reconcile };
};
