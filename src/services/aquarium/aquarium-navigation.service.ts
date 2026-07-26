import type { Aquarium } from '../../types';
import { loadAppStateFromStorage } from '../storage/local-app-state';

export type AquariumNavigationSnapshot = {
  aquariums: Aquarium[];
  currentAquariumId: string;
};

const listeners = new Set<(snapshot: AquariumNavigationSnapshot) => void>();
let snapshot: AquariumNavigationSnapshot | null = null;

export const getAquariumNavigationSnapshot = (): AquariumNavigationSnapshot => {
  if (snapshot) return snapshot;
  const state = loadAppStateFromStorage();
  snapshot = { aquariums: state.aquariums, currentAquariumId: state.currentAquariumId };
  return snapshot;
};

export const publishAquariumNavigation = (next: AquariumNavigationSnapshot) => {
  snapshot = next;
  listeners.forEach(listener => listener(next));
};

export const subscribeToAquariumNavigation = (listener: (snapshot: AquariumNavigationSnapshot) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
