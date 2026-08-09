import type { Aquarium, Fish, SpeciesAdditionPolicy } from '../../types';
import type { AquaGuideRepository } from '../repository/aquaguide.repository';
import {
  assessSpeciesAddition,
  normalizeSpeciesAdditionItems,
  type SpeciesAdditionAssessment,
  type SpeciesAdditionItem,
} from './species-addition.service';
import { getSpeciesAdditionPolicy } from './species-addition-policy';

export type FailedLivestockRecord = SpeciesAdditionItem & { message: string };

export type RecordExistingResult = {
  aquarium: Aquarium;
  assessment: SpeciesAdditionAssessment | null;
  assessmentFailure?: string;
  policy: SpeciesAdditionPolicy | null;
  savedItems: SpeciesAdditionItem[];
  failedItems: FailedLivestockRecord[];
};

export const recordExistingLivestock = async (input: {
  repository: Pick<AquaGuideRepository, 'addLivestock'>;
  aquarium: Aquarium;
  items: SpeciesAdditionItem[];
  speciesCatalog: Fish[];
  operationId: string;
}): Promise<RecordExistingResult> => {
  const items = normalizeSpeciesAdditionItems(input.items, input.speciesCatalog);
  if (items.length === 0) throw new Error('请至少选择一种已在缸内的生物。');

  const baselineAquarium = input.aquarium;
  let savedAquarium = input.aquarium;
  const savedItems: SpeciesAdditionItem[] = [];
  const failedItems: FailedLivestockRecord[] = [];

  for (const item of items) {
    try {
      savedAquarium = await input.repository.addLivestock({
        aquariumId: savedAquarium.id,
        speciesCatalogKey: item.fishId,
        quantity: item.quantity,
        entryDate: item.entryDate || new Date().toISOString().slice(0, 10),
        operationId: `${input.operationId}:${item.fishId}`,
      });
      savedItems.push(item);
    } catch (error) {
      failedItems.push({
        ...item,
        message: error instanceof Error ? error.message : '该生物没有保存成功。',
      });
    }
  }

  if (savedItems.length === 0) throw new Error(failedItems[0]?.message || '缸内生物没有保存成功。');

  try {
    const assessment = assessSpeciesAddition({
      aquarium: baselineAquarium,
      items: savedItems,
      speciesCatalog: input.speciesCatalog,
    });
    return {
      aquarium: savedAquarium,
      assessment,
      policy: assessment
        ? getSpeciesAdditionPolicy({ intent: 'record_existing', status: assessment.status })
        : null,
      savedItems,
      failedItems,
    };
  } catch (error) {
    return {
      aquarium: savedAquarium,
      assessment: null,
      assessmentFailure: error instanceof Error ? error.message : '判断暂时不可用。',
      policy: null,
      savedItems,
      failedItems,
    };
  }
};
