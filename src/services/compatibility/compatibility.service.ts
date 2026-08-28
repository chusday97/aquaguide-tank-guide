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
import type { CompatibilityDecisionReadiness, CompatibilityIntent, StockingGuidance, ObservedCoexistenceStatus } from '../../../packages/domain-rules/src';
import { getCompatibilityAddPolicy } from '../../../packages/domain-rules/src';
import { applyCanonicalCompatibilityDecision } from '../../lib/compatibility/canonical-result.adapter';

/**
 * Application boundary for compatibility decisions.
 *
 * The legacy engine supplies the evidence-rich result shape, while the shared
 * adapter applies the Domain Rules decision and evidence to every caller.
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
  status === 'insufficient_data' ? '当前可确认' : getLegacyTankCompatibilityStatusLabel(status)
);

export type CanonicalCompatibilityDecision = {
  status: TankCompatibilityStatus;
  addPolicy: TankCompatibilityAddPolicy;
  ruleCodes: string[];
  catalogVersion: string;
  ruleVersion: string;
  decisionReadiness: CompatibilityDecisionReadiness;
  stockingGuidance: StockingGuidance;
  observedStatus: ObservedCoexistenceStatus;
  evidenceIds: string[];
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
  decisionReadiness: result.metadata.decisionReadiness,
  stockingGuidance: result.stockingGuidance || {
    kind: 'unknown',
    recommendedMin: null,
    recommendedMax: null,
    constraints: [],
    confidence: 'unknown',
    evidenceIds: [],
  },
  observedStatus: result.observedStatus || 'stable',
  evidenceIds: result.evidenceIds || [],
});

const normalizeCanonicalResult = (result: TankCompatibilityResult): TankCompatibilityResult => {
  const decision = getCompatibilityDecision(result);
  return applyCanonicalCompatibilityDecision(result, decision);
};

export type {
  EvaluateTankCompatibilityInput,
  TankCompatibilityAddPolicy,
  TankCompatibilityResult,
  TankCompatibilityRule,
  TankCompatibilityStatus,
};
