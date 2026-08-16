import type { Aquarium, Fish, SpeciesAdditionPolicy } from '../../types';
import type { AquaGuideRepository } from '../repository/aquaguide.repository';
import {
  assessSpeciesAddition,
  normalizeSpeciesAdditionItems,
  type SpeciesAdditionAssessment,
  type SpeciesAdditionItem,
} from './species-addition.service';
import { getSpeciesAdditionPolicy } from './species-addition-policy';

export type UnresolvedExistingLivestockItem = {
  identityStatus: 'unresolved';
  rawName: string;
  quantity: number;
  entryDate?: string;
};
export type ExistingLivestockRecordItem = SpeciesAdditionItem | UnresolvedExistingLivestockItem;
export type FailedLivestockRecord = ExistingLivestockRecordItem & { message: string };

export const isUnresolvedExistingLivestockItem = (
  item: ExistingLivestockRecordItem,
): item is UnresolvedExistingLivestockItem => (
  'identityStatus' in item && item.identityStatus === 'unresolved'
);

export const isVerifiedExistingLivestockItem = (
  item: ExistingLivestockRecordItem,
): item is SpeciesAdditionItem => !isUnresolvedExistingLivestockItem(item);

export const getExistingLivestockItemKey = (item: ExistingLivestockRecordItem) => (
  isUnresolvedExistingLivestockItem(item)
    ? `unresolved-name:${encodeURIComponent(item.rawName.trim())}`
    : item.fishId
);

export const getExistingLivestockItemLabel = (
  item: ExistingLivestockRecordItem,
  speciesCatalog: Fish[],
) => isUnresolvedExistingLivestockItem(item)
  ? item.rawName
  : speciesCatalog.find(fish => fish.id === item.fishId)?.name || item.fishId;

export type RecordExistingResult = {
  aquarium: Aquarium;
  assessment: SpeciesAdditionAssessment | null;
  assessmentFailure?: string;
  policy: SpeciesAdditionPolicy | null;
  savedItems: ExistingLivestockRecordItem[];
  failedItems: FailedLivestockRecord[];
};

const getSafeLivestockFailureMessage = () => '该生物没有保存成功，请重试。';

export const recordExistingLivestock = async (input: {
  repository: Pick<AquaGuideRepository, 'addLivestock'>;
  aquarium: Aquarium;
  items: ExistingLivestockRecordItem[];
  speciesCatalog: Fish[];
  operationId: string;
}): Promise<RecordExistingResult> => {
  const verifiedInput = input.items.filter((item): item is SpeciesAdditionItem => !('identityStatus' in item) || item.identityStatus !== 'unresolved');
  const verifiedItems = normalizeSpeciesAdditionItems(verifiedInput, input.speciesCatalog);
  const unresolvedItems = input.items
    .filter((item): item is UnresolvedExistingLivestockItem => 'identityStatus' in item && item.identityStatus === 'unresolved')
    .map(item => ({ ...item, rawName: item.rawName.trim(), quantity: Math.max(1, Math.round(Number(item.quantity) || 1)) }))
    .filter(item => item.rawName.length > 0);
  const items: ExistingLivestockRecordItem[] = [...verifiedItems, ...unresolvedItems];
  if (items.length === 0) throw new Error('请至少选择或填写一种已在缸内的生物。');

  const baselineAquarium = input.aquarium;
  let savedAquarium = input.aquarium;
  const savedItems: ExistingLivestockRecordItem[] = [];
  const failedItems: FailedLivestockRecord[] = [];

  for (const item of items) {
    try {
      if (isUnresolvedExistingLivestockItem(item)) {
        savedAquarium = await input.repository.addLivestock({
          aquariumId: savedAquarium.id,
          identityStatus: 'unresolved',
          rawName: item.rawName,
          quantity: item.quantity,
          entryDate: item.entryDate || new Date().toISOString().slice(0, 10),
          operationId: `${input.operationId}:unresolved:${item.rawName}`,
        });
      } else {
        savedAquarium = await input.repository.addLivestock({
          aquariumId: savedAquarium.id,
          identityStatus: 'verified',
          speciesCatalogKey: item.fishId,
          quantity: item.quantity,
          entryDate: item.entryDate || new Date().toISOString().slice(0, 10),
          operationId: `${input.operationId}:${item.fishId}`,
        });
      }
      savedItems.push(item);
    } catch {
      failedItems.push({
        ...item,
        message: getSafeLivestockFailureMessage(),
      });
    }
  }

  if (savedItems.length === 0) throw new Error(failedItems[0]?.message || '缸内生物没有保存成功。');

  const savedUnresolved = savedItems.filter(isUnresolvedExistingLivestockItem);
  if (savedUnresolved.length > 0) {
    return {
      aquarium: savedAquarium,
      assessment: null,
      assessmentFailure: `已记录 ${savedUnresolved.length} 个未确认生物；身份补齐前不会给出完整混养结论。`,
      policy: null,
      savedItems,
      failedItems,
    };
  }

  try {
    const assessment = assessSpeciesAddition({
      aquarium: baselineAquarium,
      items: savedItems as SpeciesAdditionItem[],
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
  } catch {
    return {
      aquarium: savedAquarium,
      assessment: null,
      assessmentFailure: '判断暂时不可用。',
      policy: null,
      savedItems,
      failedItems,
    };
  }
};
