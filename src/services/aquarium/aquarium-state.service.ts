import type { Aquarium } from '../../types';
import { loadAppStateFromStorage, patchLocalAppState } from '../storage/local-app-state';
import { withNormalizedSpeciesBatches } from './species-batches.service';
import { applyWaterChangeHistory, isFutureWaterChangeDate } from './water-change.service';

export const persistAquariums = (aquariums: Aquarium[], currentAquariumId: string) => {
  if (!Array.isArray(aquariums) || aquariums.length === 0) {
    throw new Error('至少需要保留一个鱼缸。');
  }
  const normalizedAquariums = aquariums.map(aquarium => {
    const persistedWaterHistory = (aquarium.waterChangeHistory || [])
      .filter(dateKey => !isFutureWaterChangeDate(dateKey));
    const normalizedWaterState = applyWaterChangeHistory(aquarium, persistedWaterHistory);
    return {
      ...normalizedWaterState,
      fishes: normalizedWaterState.fishes.map(withNormalizedSpeciesBatches),
    };
  });
  const activeId = normalizedAquariums.some(item => item.id === currentAquariumId)
    ? currentAquariumId
    : normalizedAquariums[0].id;
  patchLocalAppState({ aquariums: normalizedAquariums, currentAquariumId: activeId });
  const saved = loadAppStateFromStorage();
  if (saved.aquariums.length !== normalizedAquariums.length || !saved.aquariums.some(item => item.id === activeId)) {
    throw new Error('鱼缸数据没有保存成功，请检查浏览器存储权限后重试。');
  }
  return { aquariums: saved.aquariums, currentAquariumId: activeId };
};
