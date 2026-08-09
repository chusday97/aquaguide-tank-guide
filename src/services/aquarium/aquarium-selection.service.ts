import type { Aquarium } from '../../types';

export const selectAquariumSnapshot = (
  aquariums: Aquarium[],
  preferredIds: Array<string | null | undefined>,
) => {
  for (const id of preferredIds) {
    if (!id) continue;
    const match = aquariums.find(aquarium => aquarium.id === id);
    if (match) return match;
  }
  return aquariums[0];
};
