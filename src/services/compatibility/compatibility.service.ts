import {
  evaluateSpeciesCombination as evaluateLegacySpeciesCombination,
  evaluateTankCompatibility as evaluateLegacyTankCompatibility,
  getTankCompatibilityAddPolicy as getLegacyTankCompatibilityAddPolicy,
  getTankCompatibilityStatusLabel as getLegacyTankCompatibilityStatusLabel,
  type EvaluateTankCompatibilityInput,
  type TankCompatibilityAddPolicy,
  type TankCompatibilityResult,
  type TankCompatibilityRule,
  type TankCompatibilityStatus,
} from '../../lib/tankCompatibilityEngine';

/**
 * Compatibility is the application boundary for all callers.
 *
 * The legacy engine remains an implementation detail while its evidence-rich
 * result is migrated onto the Domain Rules decision. Consumers must not import
 * tankCompatibilityEngine directly; this keeps the migration to one authority
 * explicit and prevents a second page-local rules path from appearing.
 */
export const evaluateTankCompatibility = (input: EvaluateTankCompatibilityInput): TankCompatibilityResult => (
  evaluateLegacyTankCompatibility(input)
);

export const evaluateSpeciesCombination = (species: Parameters<typeof evaluateLegacySpeciesCombination>[0]): TankCompatibilityResult => (
  evaluateLegacySpeciesCombination(species)
);

export const getTankCompatibilityAddPolicy = (status: TankCompatibilityStatus): TankCompatibilityAddPolicy => (
  getLegacyTankCompatibilityAddPolicy(status)
);

export const getTankCompatibilityStatusLabel = (status: TankCompatibilityStatus): string => (
  getLegacyTankCompatibilityStatusLabel(status)
);

export type {
  EvaluateTankCompatibilityInput,
  TankCompatibilityAddPolicy,
  TankCompatibilityResult,
  TankCompatibilityRule,
  TankCompatibilityStatus,
};
