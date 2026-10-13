import type { CompatibilityDecision } from '../../../src/modules/knowledge/knowledge.types';
import { getCompatibilityPresentation } from '../../../src/services/compatibility/compatibility-presentation.service';
import { getCompatibilityDecision } from '../../../src/services/compatibility/compatibility.service';
import type { CompatibilityAiShadowResult } from './compatibility-ai-reasoner';

export type CompatibilityProductGroundedItem = {
  text: string;
  ruleCodes: string[];
};

export type CompatibilityProductAssessment = {
  judgment: {
    status: CompatibilityAiShadowResult['finalDecision']['status'];
    headline: ReturnType<typeof getCompatibilityPresentation>['headline'];
    summary: string;
  };
  reasons: CompatibilityProductGroundedItem[];
  adjustments: CompatibilityProductGroundedItem[];
  uncertainties: CompatibilityProductGroundedItem[];
  nextAction: string;
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
    fallbackRules(decision).map(rule => ({
      text: rule.evidence || rule.title,
      ruleCodes: [rule.code],
    })),
  ).slice(0, 5)
);

const deterministicAdjustments = (
  decision: CompatibilityDecision,
  presentation: ReturnType<typeof getCompatibilityPresentation>,
  ruleCodes: string[],
): CompatibilityProductGroundedItem[] => {
  if (decision.status === 'compatible') return [];
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
): CompatibilityProductAssessment => {
  const finalDecision = getCompatibilityDecision(decision.aggregateResult, 'planned_addition');
  const presentation = getCompatibilityPresentation(decision);
  const aiNarrativeMatchesAuthority = shadow.ai.status === 'accepted'
    && shadow.ai.suggestedVerdict === finalDecision.status;

  const reasons = aiNarrativeMatchesAuthority
    ? uniqueItems(shadow.ai.reasons).slice(0, 5)
    : deterministicReasons(decision);
  const adjustments = aiNarrativeMatchesAuthority
    ? uniqueItems(shadow.ai.adjustments).slice(0, 5)
    : deterministicAdjustments(decision, presentation, finalDecision.ruleCodes);
  const uncertainties = aiNarrativeMatchesAuthority
    ? uniqueItems(shadow.ai.uncertainties).slice(0, 5)
    : decision.status === 'insufficient_data'
      ? uniqueItems(decision.missingData.map(rule => ({
        text: rule.evidence || rule.title,
        ruleCodes: [rule.code],
      }))).slice(0, 5)
      : [];

  return {
    judgment: {
      status: finalDecision.status,
      headline: presentation.headline,
      summary: decision.summary,
    },
    reasons,
    adjustments,
    uncertainties,
    nextAction: presentation.primaryActionText,
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
  };
};
