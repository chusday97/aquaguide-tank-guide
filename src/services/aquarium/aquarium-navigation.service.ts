import type { Aquarium } from '../../types';
import { loadAppStateFromStorage } from '../storage/local-app-state';
import { selectAquariumSnapshot } from './aquarium-selection.service';

export type AquariumNavigationSnapshot = {
  aquariums: Aquarium[];
  currentAquariumId: string;
};

const listeners = new Set<(snapshot: AquariumNavigationSnapshot) => void>();
let snapshot: AquariumNavigationSnapshot | null = null;

const normalizeNavigationSnapshot = (value: AquariumNavigationSnapshot): AquariumNavigationSnapshot => {
  const activeAquarium = selectAquariumSnapshot(value.aquariums, [value.currentAquariumId]);
  return {
    aquariums: value.aquariums,
    currentAquariumId: activeAquarium?.id || '',
  };
};

export const getAquariumNavigationSnapshot = (): AquariumNavigationSnapshot => {
  if (snapshot) return snapshot;
  const state = loadAppStateFromStorage();
  snapshot = normalizeNavigationSnapshot({ aquariums: state.aquariums, currentAquariumId: state.currentAquariumId });
  return snapshot;
};

export const publishAquariumNavigation = (next: AquariumNavigationSnapshot) => {
  snapshot = normalizeNavigationSnapshot(next);
  listeners.forEach(listener => listener(snapshot!));
};

export const subscribeToAquariumNavigation = (listener: (snapshot: AquariumNavigationSnapshot) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
