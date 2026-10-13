import type { CompatibilityDecision } from '../../../src/modules/knowledge/knowledge.types';
import { prioritizeDistinctCompatibilityRules, type CompatibilityAssessmentMode } from '../../../src/services/compatibility/compatibility-action.service';
import { getCompatibilityPresentation } from '../../../src/services/compatibility/compatibility-presentation.service';
import { getCompatibilityDecision } from '../../../src/services/compatibility/compatibility.service';
import { COMPATIBILITY_PRODUCT_SCHEMA_VERSION, type CompatibilityProductSchemaVersion } from '../../../src/services/compatibility/compatibility-product-contract';
import {
  buildCompatibilityReadableConclusion,
  type CompatibilityReadableConclusion,
} from '../../../src/services/compatibility/compatibility-readable-copy.service';
import type { CompatibilityAiShadowResult } from './compatibility-ai-reasoner';

export type CompatibilityProductGroundedItem = {
  text: string;
  ruleCodes: string[];
};

export type CompatibilityProductAssessment = {
  schemaVersion: CompatibilityProductSchemaVersion;
  assessmentMode: CompatibilityAssessmentMode;
  main: CompatibilityReadableConclusion;
  details: {
    label: '查看依据';
    reasons: CompatibilityProductGroundedItem[];
    adjustments: CompatibilityProductGroundedItem[];
    uncertainties: CompatibilityProductGroundedItem[];
    presentation: ReturnType<typeof getCompatibilityPresentation>;
    explanation: {
      source: 'ai_grounded' | 'deterministic_fallback';
      aiStatus: CompatibilityAiShadowResult['ai']['status'];
      aiReason: string | null;
      confidence: CompatibilityAiShadowResult['ai']['confidence'] | null;
      suggestedVerdict: CompatibilityAiShadowResult['ai']['suggestedVerdict'] | null;
      model: string | null;
      repairCount: number;
      narrativeAccepted: boolean;
    };
    authority: CompatibilityAiShadowResult['finalDecision'] & {
      finalSource: 'deterministic';
    };
  };
};

const uniqueItems = (items: CompatibilityProductGroundedItem[]) => {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = `${item.text.trim()}::${item.ruleCodes.join(',')}`;
    if (!item.text.trim() || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const fallbackRules = (decision: CompatibilityDecision) => {
  if (decision.status === 'not_recommended') return decision.blockingRules;
  if (decision.status === 'caution') return [...decision.warningRules, ...decision.missingData];
  if (decision.status === 'insufficient_data') return decision.missingData;
  return decision.passedRules;
};

const deterministicReasons = (decision: CompatibilityDecision): CompatibilityProductGroundedItem[] => (
  uniqueItems(
    prioritizeDistinctCompatibilityRules(fallbackRules(decision)).map(rule => ({
      text: rule.evidence || rule.title,
      ruleCodes: [rule.code],
    })),
  ).slice(0, 5)
);

const deterministicAdjustments = (
  decision: CompatibilityDecision,
  presentation: ReturnType<typeof getCompatibilityPresentation>,
  ruleCodes: string[],
  assessmentMode: CompatibilityAssessmentMode,
): CompatibilityProductGroundedItem[] => {
  if (decision.status === 'compatible') return [];
  if (assessmentMode === 'current_tank') {
    return [{
      text: presentation.primaryActionText,
      ruleCodes: ruleCodes.slice(0, 8),
    }];
  }
  const suggestions = uniqueItems(
    decision.suggestions.map(text => ({ text, ruleCodes: ruleCodes.slice(0, 8) })),
  ).slice(0, 5);
  if (suggestions.length > 0) return suggestions;
  return [{
    text: presentation.primaryActionText,
    ruleCodes: ruleCodes.slice(0, 8),
  }];
};

export const buildCompatibilityProductAssessment = (
  decision: CompatibilityDecision,
  shadow: CompatibilityAiShadowResult,
  assessmentMode: CompatibilityAssessmentMode = 'planned_addition',
): CompatibilityProductAssessment => {
  const finalDecision = getCompatibilityDecision(
    decision.aggregateResult,
    assessmentMode === 'current_tank' ? 'record_existing' : 'planned_addition',
  );
  if (decision.status !== finalDecision.status) {
    throw new Error(`COMPATIBILITY_AUTHORITY_STATUS_MISMATCH:${decision.status}:${finalDecision.status}`);
  }
  const presentation = getCompatibilityPresentation(decision, assessmentMode);
  const aiNarrativeMatchesAuthority = shadow.ai.status === 'accepted'
    && shadow.ai.suggestedVerdict === finalDecision.status;

  const deterministicReasonItems = deterministicReasons(decision);
  const reasons = aiNarrativeMatchesAuthority
    ? uniqueItems([...deterministicReasonItems.slice(0, 4), ...shadow.ai.reasons]).slice(0, 5)
    : deterministicReasonItems;
  const adjustments = aiNarrativeMatchesAuthority
    ? uniqueItems(shadow.ai.adjustments).slice(0, 5)
    : deterministicAdjustments(decision, presentation, finalDecision.ruleCodes, assessmentMode);
  const uncertainties = aiNarrativeMatchesAuthority
    ? uniqueItems(shadow.ai.uncertainties).slice(0, 5)
    : decision.status === 'insufficient_data'
      ? uniqueItems(prioritizeDistinctCompatibilityRules(decision.missingData).map(rule => ({
        text: rule.evidence || rule.title,
        ruleCodes: [rule.code],
      }))).slice(0, 5)
      : [];

  const main = buildCompatibilityReadableConclusion(
    decision,
    aiNarrativeMatchesAuthority
      ? { reasons: shadow.ai.reasons, adjustments: shadow.ai.adjustments }
      : {},
    assessmentMode,
  );

  return {
    schemaVersion: COMPATIBILITY_PRODUCT_SCHEMA_VERSION,
    assessmentMode,
    main,
    details: {
      label: '查看依据',
      reasons,
      adjustments,
      uncertainties,
      presentation,
      explanation: {
        source: aiNarrativeMatchesAuthority ? 'ai_grounded' : 'deterministic_fallback',
        aiStatus: shadow.ai.status,
        aiReason: shadow.ai.reason || null,
        confidence: shadow.ai.confidence || null,
        suggestedVerdict: shadow.ai.suggestedVerdict || null,
        model: shadow.provenance.model || null,
        repairCount: shadow.provenance.repairCount,
        narrativeAccepted: aiNarrativeMatchesAuthority,
      },
      authority: {
        ...finalDecision,
        finalSource: 'deterministic',
      },
    },
  };
};
