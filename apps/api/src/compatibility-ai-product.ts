import type { CompatibilityDecision } from '../../../src/modules/knowledge/knowledge.types';
import {
  getCompatibilityRuleFamily,
  prioritizeDistinctCompatibilityRules,
  type CompatibilityAssessmentMode,
} from '../../../src/services/compatibility/compatibility-action.service';
import { getCompatibilityPresentation } from '../../../src/services/compatibility/compatibility-presentation.service';
import { getCompatibilityDecision } from '../../../src/services/compatibility/compatibility.service';
import { COMPATIBILITY_PRODUCT_SCHEMA_VERSION, type CompatibilityProductSchemaVersion } from '../../../src/services/compatibility/compatibility-product-contract';
import {
  buildCompatibilityReadableConclusion,
  isCompatibilityUserReadableText,
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
  ).slice(0, 3)
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
  ).slice(0, 2);
  if (suggestions.length > 0) return suggestions;
  return [{
    text: presentation.primaryActionText,
    ruleCodes: ruleCodes.slice(0, 8),
  }];
};

const FAMILY_REASON_PATTERNS: Record<string, RegExp> = {
  water_type: /(水体|淡水|海水|freshwater|marine|saltwater)/i,
  predation: /(捕食|吞食|追食|猎物|鱼苗|predat|prey)/i,
  housing: /(单养|单独|独立|species.?tank|single.?housing)/i,
  temperature: /(温度|水温|temperature)/i,
  aggression: /(追鳍|攻击|咬|冲突|aggress|fin.?nip)/i,
  territory: /(领地|守地|压迫|territor)/i,
  group_size: /(群|数量|成群|school|group)/i,
  ph: /(酸碱|pH)/i,
  space: /(空间|缸体|体积|长度|space|volume|tank.?length)/i,
  bioload: /(负荷|过滤|维护|bioload)/i,
  missing_information: /(资料|信息|确认|证据|missing|unknown|evidence)/i,
  observed: /(异常|追逐|受伤|拒食|呼吸|observed|injury|chasing)/i,
  equipment: /(设备|过滤|加热|增氧|filter|heater|oxygen|equipment)/i,
  compatibility_clear: /(可以|兼容|无.*冲突|没有.*冲突|compatible|no .*conflict)/i,
};

const FAMILY_ACTION_PATTERNS: Record<string, RegExp> = {
  water_type: /(分缸|分开|更换|不要.*同一缸|淡水|海水|separate|replace)/i,
  predation: /(分隔|隔离|更换|不要.*混养|确认.*捕食|鱼苗|separate|isolate|replace|predat)/i,
  housing: /(单养|分开|更换|独立|separate|replace|single)/i,
  temperature: /(分缸|温度|水温|更换|separate|temperature|replace)/i,
  aggression: /(分隔|隔离|更换|遮挡|separate|isolate|replace)/i,
  territory: /(遮挡|退让|分缸|空间|separate|cover|territor)/i,
  group_size: /(增加|补足|数量|群|increase|group|school)/i,
  ph: /(调整|测|酸碱|pH|adjust|measure)/i,
  space: /(减少|升级|换缸|空间|reduce|upgrade|space)/i,
  bioload: /(减少|过滤|维护|reduce|filter|maintenance)/i,
  missing_information: /(确认|补齐|补足|等待|confirm|verify|complete)/i,
  observed: /(分隔|隔离|观察|处理|separate|isolate|monitor)/i,
  equipment: /(设备|过滤|加热|增氧|调整|filter|heater|oxygen|equipment|adjust)/i,
};

const itemMatchesRuleMeaning = (
  item: CompatibilityProductGroundedItem,
  kind: 'reason' | 'action',
) => item.ruleCodes.every(code => {
  const family = getCompatibilityRuleFamily(code);
  const pattern = kind === 'reason' ? FAMILY_REASON_PATTERNS[family] : FAMILY_ACTION_PATTERNS[family];
  return pattern ? pattern.test(item.text) : false;
});

const clampAiItems = (
  items: CompatibilityProductGroundedItem[],
  allowedRuleCodes: ReadonlySet<string>,
  kind: 'reason' | 'action',
) => uniqueItems(items.filter(item => (
  item.ruleCodes.length > 0
  && item.ruleCodes.every(code => allowedRuleCodes.has(code))
  && isCompatibilityUserReadableText(item.text, kind)
  && itemMatchesRuleMeaning(item, kind)
))).slice(0, kind === 'reason' ? 3 : 2);

const mergeReadableText = (
  primary: string[],
  fallback: string[],
  kind: 'reason' | 'action',
) => {
  const seen = new Set<string>();
  return [...primary, ...fallback].filter(text => {
    const normalized = text.trim();
    if (!isCompatibilityUserReadableText(normalized, kind) || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  }).slice(0, 2);
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
  const deterministicReasonItems = deterministicReasons(decision);
  const primaryRuleCodes = new Set(deterministicReasonItems.flatMap(item => item.ruleCodes));
  const aiAuthorityMatches = shadow.ai.status === 'accepted'
    && shadow.ai.suggestedVerdict === finalDecision.status;
  const clampedAiReasons = aiAuthorityMatches
    ? clampAiItems(shadow.ai.reasons, primaryRuleCodes, 'reason')
    : [];
  const clampedAiAdjustments = aiAuthorityMatches
    ? clampAiItems(shadow.ai.adjustments, primaryRuleCodes, 'action')
    : [];
  const requiresAction = decision.status === 'caution' || decision.status === 'not_recommended';
  const aiNarrativeMatchesAuthority = aiAuthorityMatches
    && clampedAiReasons.length > 0
    && (!requiresAction || clampedAiAdjustments.length > 0);

  const deterministicAdjustmentItems = deterministicAdjustments(
    decision,
    presentation,
    finalDecision.ruleCodes,
    assessmentMode,
  );
  const reasons = aiNarrativeMatchesAuthority
    ? uniqueItems([...clampedAiReasons, ...deterministicReasonItems]).slice(0, 3)
    : deterministicReasonItems;
  const adjustments = aiNarrativeMatchesAuthority
    ? uniqueItems([...clampedAiAdjustments, ...deterministicAdjustmentItems]).slice(0, 2)
    : deterministicAdjustmentItems;
  const uncertainties = aiNarrativeMatchesAuthority
    ? clampAiItems(shadow.ai.uncertainties, primaryRuleCodes, 'reason')
    : decision.status === 'insufficient_data'
      ? uniqueItems(prioritizeDistinctCompatibilityRules(decision.missingData).map(rule => ({
        text: rule.evidence || rule.title,
        ruleCodes: [rule.code],
      }))).slice(0, 3)
      : [];

  const deterministicMain = buildCompatibilityReadableConclusion(decision, {}, assessmentMode);
  const main = aiNarrativeMatchesAuthority
    ? {
      judgment: deterministicMain.judgment,
      why: mergeReadableText(clampedAiReasons.map(item => item.text), deterministicMain.why, 'reason'),
      howTo: decision.status === 'compatible'
        ? deterministicMain.howTo
        : mergeReadableText(clampedAiAdjustments.map(item => item.text), deterministicMain.howTo, 'action'),
    }
    : deterministicMain;

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
