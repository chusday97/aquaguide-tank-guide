import type { Aquarium, Fish } from '../types';
import { buildTankDecisionContext } from './tankDecisionContext';
import type { RelocationExecutionRequest } from './relocationExecutionPolicy';

export type RelocationConfirmationRequestIntent = {
  subjectSpeciesId: string;
  subjectName: string;
  quantity: number;
  destinationAquariumId: string;
  destinationAquariumName: string;
};

export type RelocationConfirmationFacts = {
  sourceAquariumName: string;
  destinationAquariumName: string;
  speciesName: string;
};

export type RelocationConfirmationRequestBlockReason =
  | 'invalid_operation_id'
  | 'invalid_quantity'
  | 'source_aquarium_not_found'
  | 'destination_aquarium_not_found'
  | 'same_aquarium'
  | 'subject_not_resolved'
  | 'subject_quantity_changed'
  | 'multiple_source_records'
  | 'source_record_not_found'
  | 'source_record_quantity_mismatch'
  | 'source_batch_missing'
  | 'requires_multi_batch_relocation'
  | 'source_batch_quantity_mismatch';

export type RelocationConfirmationRequestBuildResult =
  | {
      status: 'ready';
      request: RelocationExecutionRequest;
      facts: RelocationConfirmationFacts;
    }
  | {
      status: 'blocked';
      reason: RelocationConfirmationRequestBlockReason;
    };

type BuildRelocationConfirmationRequestInput = {
  aquariums: Aquarium[];
  sourceAquariumId: string;
  catalog: Fish[];
  intent: RelocationConfirmationRequestIntent;
  operationId: string;
};

const positiveBatches = (aquariumFish: Aquarium['fishes'][number]) => (
  (aquariumFish.batches || []).filter(batch => Number.isFinite(batch.quantity) && batch.quantity > 0)
);

export const buildRelocationConfirmationRequest = ({
  aquariums,
  sourceAquariumId,
  catalog,
  intent,
  operationId,
}: BuildRelocationConfirmationRequestInput): RelocationConfirmationRequestBuildResult => {
  if (!operationId.trim()) return { status: 'blocked', reason: 'invalid_operation_id' };
  if (!Number.isInteger(intent.quantity) || intent.quantity < 1) {
    return { status: 'blocked', reason: 'invalid_quantity' };
  }

  const sourceAquarium = aquariums.find(item => item.id === sourceAquariumId);
  if (!sourceAquarium) return { status: 'blocked', reason: 'source_aquarium_not_found' };
  const destinationAquarium = aquariums.find(item => item.id === intent.destinationAquariumId);
  if (!destinationAquarium) return { status: 'blocked', reason: 'destination_aquarium_not_found' };
  if (sourceAquarium.id === destinationAquarium.id) return { status: 'blocked', reason: 'same_aquarium' };

  const context = buildTankDecisionContext({ aquarium: sourceAquarium, catalog });
  const subject = context.resolvedLivestock.find(item => item.species.id === intent.subjectSpeciesId);
  if (!subject) return { status: 'blocked', reason: 'subject_not_resolved' };
  if (subject.quantity !== intent.quantity) return { status: 'blocked', reason: 'subject_quantity_changed' };

  // The formal intervention is a whole-canonical-species action. V1 mutation can
  // move one explicit source record/batch only, so any record aggregation is
  // ambiguous and must stay blocked instead of selecting the first match.
  if (subject.sourceRecordIds.length !== 1) {
    return { status: 'blocked', reason: 'multiple_source_records' };
  }

  const sourceAquariumFishId = subject.sourceRecordIds[0];
  const sourceRecord = sourceAquarium.fishes.find(item => item.id === sourceAquariumFishId);
  if (!sourceRecord) return { status: 'blocked', reason: 'source_record_not_found' };
  if (sourceRecord.quantity !== intent.quantity) {
    return { status: 'blocked', reason: 'source_record_quantity_mismatch' };
  }

  const batches = positiveBatches(sourceRecord);
  if (batches.length === 0) return { status: 'blocked', reason: 'source_batch_missing' };
  if (batches.length !== 1) return { status: 'blocked', reason: 'requires_multi_batch_relocation' };
  const sourceBatch = batches[0];
  if (sourceBatch.quantity !== intent.quantity) {
    return { status: 'blocked', reason: 'source_batch_quantity_mismatch' };
  }

  return {
    status: 'ready',
    request: {
      sourceAquariumId: sourceAquarium.id,
      sourceAquariumFishId,
      sourceBatchId: sourceBatch.id,
      destinationAquariumId: destinationAquarium.id,
      quantity: intent.quantity,
      operationId,
    },
    facts: {
      sourceAquariumName: sourceAquarium.name,
      destinationAquariumName: destinationAquarium.name,
      speciesName: subject.species.name || intent.subjectName,
    },
  };
};
