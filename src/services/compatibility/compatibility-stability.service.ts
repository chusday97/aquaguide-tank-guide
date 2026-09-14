import type { Aquarium } from '../../types';

export type CompatibilityStabilityConfirmation = 'stable' | 'unknown';

export const applyCompatibilityStabilityConfirmation = (
  aquarium: Aquarium | null | undefined,
  confirmation: CompatibilityStabilityConfirmation,
): Aquarium | null | undefined => {
  if (!aquarium || confirmation !== 'stable') return aquarium;
  const current = aquarium.stabilityContext || {};
  return {
    ...aquarium,
    stabilityContext: {
      ...current,
      establishedDays: Math.max(current.establishedDays || 0, 90),
      stableCoexistenceDays: Math.max(current.stableCoexistenceDays || 0, 60),
      maintenanceConsistent: true,
      recentWaterQualityIncident: false,
    },
  };
};
