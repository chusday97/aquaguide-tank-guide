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
import type { CompatibilityIntent } from '../../../packages/domain-rules/src';
import { getCompatibilityAddPolicy } from '../../../packages/domain-rules/src';

/**
 * Compatibility is the application boundary for all callers.
 *
 * The legacy engine remains an evidence implementation detail. Its result is
 * normalized here so every service consumer receives the Domain Rules status
 * and policy, while preserving the existing evidence-rich shape for the UI.
 */
export const evaluateTankCompatibility = (input: EvaluateTankCompatibilityInput): TankCompatibilityResult => (
  normalizeCanonicalResult(evaluateLegacyTankCompatibility(input))
);

export const evaluateSpeciesCombination = (species: Parameters<typeof evaluateLegacySpeciesCombination>[0]): TankCompatibilityResult => (
  normalizeCanonicalResult(evaluateLegacySpeciesCombination(species))
);

export const getTankCompatibilityAddPolicy = (status: TankCompatibilityStatus): TankCompatibilityAddPolicy => (
  getLegacyTankCompatibilityAddPolicy(status)
);

export const getTankCompatibilityStatusLabel = (status: TankCompatibilityStatus): string => (
  getLegacyTankCompatibilityStatusLabel(status)
);

export type CanonicalCompatibilityDecision = {
  status: TankCompatibilityStatus;
  addPolicy: TankCompatibilityAddPolicy;
  ruleCodes: string[];
  catalogVersion: string;
  ruleVersion: string;
};

export const getCompatibilityDecision = (
  result: TankCompatibilityResult,
  intent: CompatibilityIntent = result.metadata.intent,
): CanonicalCompatibilityDecision => ({
  status: result.metadata.domainStatus,
  addPolicy: getCompatibilityAddPolicy(intent, result.metadata.domainStatus),
  ruleCodes: result.metadata.domainRuleCodes,
  catalogVersion: result.metadata.catalogVersion,
  ruleVersion: result.metadata.ruleVersion,
});

const normalizeCanonicalResult = (result: TankCompatibilityResult): TankCompatibilityResult => {
  const decision = getCompatibilityDecision(result);
  if (decision.status === result.status) return result;
  const summary = decision.status === 'not_recommended'
    ? result.blockingRules[0]?.evidence || result.summary
    : decision.status === 'insufficient_data'
      ? result.missingData[0]?.evidence || '关键资料不足，暂时无法可靠判断。'
      : decision.status === 'caution'
        ? result.warningRules[0]?.evidence || result.summary
        : result.summary;
  return {
    ...result,
    status: decision.status,
    riskLevel: decision.status === 'not_recommended'
      ? 'high'
      : decision.status === 'insufficient_data'
        ? 'unknown'
        : decision.status === 'caution'
          ? 'medium'
          : 'none',
    summary,
  };
};

export type {
  EvaluateTankCompatibilityInput,
  TankCompatibilityAddPolicy,
  TankCompatibilityResult,
  TankCompatibilityRule,
  TankCompatibilityStatus,
};
