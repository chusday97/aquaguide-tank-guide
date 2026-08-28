import type { CompatibilityDecision } from '../../../packages/domain-rules/src';
import type {
  TankCompatibilityResult,
  TankCompatibilityRiskLevel,
} from '../../lib/tankCompatibilityEngine';

/**
 * Keeps the legacy evidence-rich result shape while replacing its final
 * decision fields with the Domain Rules decision. This lets frozen UI callers
 * keep their existing import boundary during the migration.
 */
export const applyCanonicalCompatibilityDecision = (
  result: TankCompatibilityResult,
  decision: CompatibilityDecision,
): TankCompatibilityResult => {
  const riskLevel: TankCompatibilityRiskLevel = decision.status === 'not_recommended'
    ? 'high'
    : decision.status === 'insufficient_data'
      ? 'unknown'
      : decision.status === 'caution'
        ? 'medium'
        : 'none';
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
    riskLevel,
    summary,
  };
};
