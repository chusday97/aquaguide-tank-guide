import type { Aquarium, AquariumFish } from '../../types';
import { appendSpeciesBatch, createSpeciesBatch, removeSpeciesBatchQuantity } from './species-batches.service';

export type RelocateLivestockCommand = {
  sourceAquariumId: string;
  sourceAquariumFishId: string;
  sourceBatchId: string;
  destinationAquariumId: string;
  quantity: number;
  operationId: string;
};

export type RelocateLivestockResult = {
  aquariums: Aquarium[];
  sourceAquarium: Aquarium;
  destinationAquarium: Aquarium;
  destinationFishId: string;
  destinationBatchId: string;
  replayed: boolean;
};

const relocationBatchId = (operationId: string) => `relocation_batch_${operationId}`;
const relocationSpeciesId = (operationId: string) => `relocation_species_${operationId}`;

const replaceAquarium = (aquariums: Aquarium[], next: Aquarium) => (
  aquariums.map(item => item.id === next.id ? next : item)
);

export const relocateLivestockInAquariums = (
  aquariums: Aquarium[],
  input: RelocateLivestockCommand,
): RelocateLivestockResult => {
  if (input.sourceAquariumId === input.destinationAquariumId) throw new Error('源鱼缸和目标鱼缸必须不同。');
  if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error('迁移数量必须是正整数。');
  if (!input.operationId.trim()) throw new Error('迁移操作标识不能为空。');

  const sourceAquarium = aquariums.find(item => item.id === input.sourceAquariumId);
  const destinationAquarium = aquariums.find(item => item.id === input.destinationAquariumId);
  if (!sourceAquarium) throw new Error('没有找到源鱼缸。');
  if (!destinationAquarium) throw new Error('没有找到目标鱼缸。');

  const sourceFish = sourceAquarium.fishes.find(item => item.id === input.sourceAquariumFishId);
  if (!sourceFish) throw new Error('没有找到需要迁移的缸内物种。');
  if (sourceFish.identityStatus === 'unresolved' || sourceFish.fishId.startsWith('unresolved:')) {
    throw new Error('未确认身份的生物不能使用已验证物种迁移路径。');
  }

  const sourceBatch = sourceFish.batches?.find(batch => batch.id === input.sourceBatchId);
  if (!sourceBatch) throw new Error('没有找到需要迁移的批次。');
  if (input.quantity > sourceBatch.quantity) throw new Error('迁移数量超出当前批次范围。');

  const destinationBatchId = relocationBatchId(input.operationId);
  const replayFish = destinationAquarium.fishes.find(item => (
    item.fishId === sourceFish.fishId
    && item.batches?.some(batch => batch.id === destinationBatchId)
  ));
  if (replayFish) {
    const replayBatch = replayFish.batches!.find(batch => batch.id === destinationBatchId)!;
    if (replayBatch.quantity !== input.quantity) throw new Error('这个操作号已经用于另一项迁移。');
    return {
      aquariums,
      sourceAquarium,
      destinationAquarium,
      destinationFishId: replayFish.id,
      destinationBatchId,
      replayed: true,
    };
  }

  const updatedSourceFish = removeSpeciesBatchQuantity(sourceFish, sourceBatch.id, input.quantity);
  const nextSourceAquarium: Aquarium = {
    ...sourceAquarium,
    fishes: updatedSourceFish
      ? sourceAquarium.fishes.map(item => item.id === sourceFish.id ? updatedSourceFish : item)
      : sourceAquarium.fishes.filter(item => item.id !== sourceFish.id),
  };

  const movedBatch = createSpeciesBatch({
    id: destinationBatchId,
    quantity: input.quantity,
    entryDate: sourceBatch.entryDate,
    lifeStage: sourceBatch.lifeStage,
    reproductiveState: sourceBatch.reproductiveState,
  });

  const existingDestinationFish = destinationAquarium.fishes.find(item => (
    item.identityStatus !== 'unresolved'
    && item.fishId === sourceFish.fishId
  ));

  let destinationFish: AquariumFish;
  if (existingDestinationFish) {
    destinationFish = appendSpeciesBatch(existingDestinationFish, movedBatch);
  } else {
    destinationFish = {
      id: relocationSpeciesId(input.operationId),
      fishId: sourceFish.fishId,
      identityStatus: 'verified',
      quantity: input.quantity,
      entryDate: sourceBatch.entryDate,
      batches: [movedBatch],
    };
  }

  const nextDestinationAquarium: Aquarium = {
    ...destinationAquarium,
    fishes: existingDestinationFish
      ? destinationAquarium.fishes.map(item => item.id === existingDestinationFish.id ? destinationFish : item)
      : [...destinationAquarium.fishes, destinationFish],
  };

  let nextAquariums = replaceAquarium(aquariums, nextSourceAquarium);
  nextAquariums = replaceAquarium(nextAquariums, nextDestinationAquarium);

  return {
    aquariums: nextAquariums,
    sourceAquarium: nextSourceAquarium,
    destinationAquarium: nextDestinationAquarium,
    destinationFishId: destinationFish.id,
    destinationBatchId,
    replayed: false,
  };
};
