import { z } from 'zod';
import { apiConfig } from './config';
import { fetchJsonResponse, ProviderError, textJsonRequestExtrasForModel } from './ai/provider';
import type { Aquarium, Fish } from '../../../src/types';
import {
  getCompatibilityDecision,
  type CanonicalCompatibilityDecision,
  type TankCompatibilityResult,
  type TankCompatibilityStatus,
} from '../../../src/services/compatibility/compatibility.service';
import { getReviewedCompatibilityProfile } from '../../../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledgeForFish } from '../../../src/modules/knowledge/speciesKnowledge';
import {
  prioritizeDistinctCompatibilityRules,
  prioritizeIndependentBlockingCoverage,
  type CompatibilityAssessmentMode,
} from '../../../src/services/compatibility/compatibility-action.service';
import type { CompatibilityResolutionTarget } from '../../../src/services/compatibility/compatibility-decision-plan.service';

export const COMPATIBILITY_AI_PROMPT_VERSION = 'compatibility-v4-shadow-v5-resolution-grounding';

const verdictSchema = z.enum(['compatible', 'caution', 'not_recommended', 'insufficient_data']);
const groundedItemSchema = z.object({
  text: z.string().trim().min(1).max(360),
  ruleCodes: z.array(z.string().trim().min(1)).min(1).max(3),
}).strict();

export const compatibilityAiProviderOutputSchema = z.object({
  suggestedVerdict: verdictSchema,
  reasons: z.array(groundedItemSchema).min(1).max(3),
  adjustments: z.array(groundedItemSchema).max(2),
  uncertainties: z.array(groundedItemSchema).max(3),
  confidence: z.enum(['low', 'medium', 'high']),
  evidenceIds: z.array(z.string().trim().min(1)).max(48),
}).strict();

export type CompatibilityAiProviderOutput = z.infer<typeof compatibilityAiProviderOutputSchema>;

export type CompatibilityAiProviderReadiness = {
  configured: boolean;
  host: string | null;
  model: string;
  fallbackModels: string[];
  timeoutMs: number;
};

export type CompatibilityAiReasoningProvider = ((input: {
  system: string;
  user: string;
}) => Promise<{ model: string; output: unknown }>) & {
  readiness?: () => CompatibilityAiProviderReadiness;
};

const providerHost = (baseUrl: string) => {
  try {
    return new URL(baseUrl).host;
  } catch {
    return null;
  }
};

export const buildCompatibilityAiProviderReadiness = (
  config: Pick<typeof apiConfig, 'aiApiKey' | 'aiBaseUrl' | 'compatibilityAiModel' | 'compatibilityAiFallbackModels' | 'aiTimeoutMs'>,
): CompatibilityAiProviderReadiness => ({
  configured: Boolean(config.aiApiKey && config.aiBaseUrl && config.compatibilityAiModel),
  host: providerHost(config.aiBaseUrl),
  model: config.compatibilityAiModel,
  fallbackModels: [...config.compatibilityAiFallbackModels],
  timeoutMs: config.aiTimeoutMs,
});

export const getCompatibilityAiProviderReadiness = () => buildCompatibilityAiProviderReadiness(apiConfig);

export type CompatibilityAiShadowInput = {
  deterministicResult: TankCompatibilityResult;
  tank?: Aquarium | null;
  existingSpecies: Array<{ species: Fish; quantity: number }>;
  candidateSpecies: Fish;
  candidateQuantity?: number;
};

export type CompatibilityAiCombinationItem = {
  species: Fish;
  quantity: number;
  origin: 'existing' | 'planned' | 'mixed';
  existingQuantity?: number;
  plannedQuantity?: number;
};

export type CompatibilityAiCombinationInput = {
  deterministicResult: TankCompatibilityResult;
  tank?: Aquarium | null;
  items: CompatibilityAiCombinationItem[];
  assessmentMode?: CompatibilityAssessmentMode;
  resolutionTargets?: CompatibilityResolutionTarget[];
};

const assessmentModeFor = (input: CompatibilityAiCombinationInput): CompatibilityAssessmentMode => (
  input.assessmentMode
  || (input.items.some(item => item.origin === 'planned' || item.origin === 'mixed' || (item.plannedQuantity || 0) > 0)
    ? 'planned_addition'
    : 'current_tank')
);

const decisionIntentFor = (mode: CompatibilityAssessmentMode) => (
  mode === 'current_tank' ? 'record_existing' as const : 'planned_addition' as const
);

export type CompatibilityAiShadowResult = {
  mode: 'shadow';
  finalDecision: CanonicalCompatibilityDecision;
  ai: {
    status: 'accepted' | 'skipped' | 'unavailable' | 'rejected';
    reason?: string;
    suggestedVerdict?: TankCompatibilityStatus;
    reasons: Array<{ text: string; ruleCodes: string[] }>;
    adjustments: Array<{ text: string; ruleCodes: string[] }>;
    uncertainties: Array<{ text: string; ruleCodes: string[] }>;
    confidence?: 'low' | 'medium' | 'high';
  };
  provenance: {
    promptVersion: string;
    authorityVersion: string;
    catalogVersion: string;
    ruleVersion: string;
    evidenceIds: string[];
    model?: string;
    repairCount: number;
  };
};

const reviewedKnowledgeSnapshot = (species: Fish) => {
  const profile = getReviewedCompatibilityProfile(species.id);
  const knowledge = getReviewedSpeciesKnowledgeForFish(species);
  const identity = {
    catalogKey: species.id,
    commonName: species.name,
    scientificName: species.scientificName,
  };
  if (!profile || !knowledge) {
    return {
      ...identity,
      factScope: 'identity_only' as const,
      compatibilityProfile: undefined,
      reviewedKnowledge: {},
    };
  }
  const reviewedField = <T extends { evidence?: { reviewStatus?: string; sourceIds?: string[] } } | undefined>(field: T) => (
    field?.evidence?.reviewStatus === 'reviewed' ? field : undefined
  );
  const environment = reviewedField(knowledge.environment);
  const social = reviewedField(knowledge.socialBehavior);
  const space = reviewedField(knowledge.spaceAndGrowth);
  return {
    ...identity,
    factScope: 'reviewed_profile' as const,
    compatibilityProfile: {
      waterType: profile.waterType,
      waterTypes: profile.waterTypes,
      behaviorTraits: profile.behaviorTraits,
      minimumGroupSize: profile.minimumGroupSize,
      predationTargets: profile.predationTargets,
      confidence: profile.confidence,
      requiredFacts: profile.requiredFacts || [],
      evidenceIds: profile.citations.map(item => item.id),
    },
    reviewedKnowledge: {
      environment: environment ? {
        waterType: environment.waterType,
        waterTypes: environment.waterTypes,
        temperatureRangeC: environment.temperatureRangeC,
        phRange: environment.phRange,
        hardnessDgh: environment.hardnessDgh,
        sourceIds: environment.evidence.sourceIds,
      } : undefined,
      social: social ? {
        mode: social.mode,
        minimumGroupSize: social.minimumGroupSize,
        recommendedGroupSize: social.recommendedGroupSize,
        swimmingZone: social.swimmingZone,
        territoriality: social.territoriality,
        finNipping: social.finNipping,
        finNipVulnerability: social.finNipVulnerability,
        swimmingPace: social.swimmingPace,
        predationRisk: social.predationRisk,
        predationVulnerability: social.predationVulnerability,
        summary: social.summary,
        sourceIds: social.evidence.sourceIds,
      } : undefined,
      space: space ? {
        adultLengthCm: space.adultLengthCm,
        minVolumeLiters: space.minVolumeLiters,
        minTankLengthCm: space.minTankLengthCm,
        activityLevel: space.activityLevel,
        swimmingZone: space.swimmingZone,
        needsCover: space.needsCover,
        needsHidingPlaces: space.needsHidingPlaces,
        sourceIds: space.evidence.sourceIds,
      } : undefined,
    },
  };
};

const ruleSnapshot = (result: TankCompatibilityResult) => (
  [...result.blockingRules, ...result.warningRules, ...result.missingData, ...result.passedRules]
    .map(rule => ({
      code: rule.code,
      title: rule.title,
      evidence: rule.evidence,
      severity: rule.severity,
      reviewStatus: rule.reviewStatus,
      confidence: rule.confidence,
      affectedSpeciesIds: rule.affectedSpeciesIds,
      evidenceIds: rule.citations.map(item => item.id),
    }))
);

const primaryNarrativeRules = (
  result: TankCompatibilityResult,
  assessmentMode: CompatibilityAssessmentMode,
) => {
  const finalDecision = getCompatibilityDecision(result, decisionIntentFor(assessmentMode));
  const relevantRules = finalDecision.status === 'not_recommended'
    ? result.blockingRules
    : finalDecision.status === 'caution'
      ? [...result.warningRules, ...result.missingData]
      : finalDecision.status === 'insufficient_data'
        ? result.missingData
        : result.passedRules;
  const selected = (
    finalDecision.status === 'not_recommended'
      ? prioritizeIndependentBlockingCoverage(prioritizeDistinctCompatibilityRules(relevantRules))
      : prioritizeDistinctCompatibilityRules(relevantRules)
  ).slice(0, 3);
  if (selected.length > 0) return selected;
  const domainCodes = new Set(result.metadata.domainRuleCodes || []);
  return prioritizeDistinctCompatibilityRules(
    [...result.blockingRules, ...result.warningRules, ...result.missingData, ...result.passedRules]
      .filter(rule => domainCodes.has(rule.code)),
  ).slice(0, 3);
};

const allowedNarrativeRuleCodes = (
  result: TankCompatibilityResult,
  assessmentMode: CompatibilityAssessmentMode,
) => new Set(primaryNarrativeRules(result, assessmentMode).map(rule => rule.code));

const allowedEvidenceIds = (result: TankCompatibilityResult) => new Set([
  ...(result.evidenceIds || []),
  ...ruleSnapshot(result).flatMap(rule => rule.evidenceIds),
]);

const hasUnknownGrounding = (
  output: CompatibilityAiProviderOutput,
  rules: ReadonlySet<string>,
  evidence: ReadonlySet<string>,
) => {
  if (output.evidenceIds.some(id => !evidence.has(id))) return true;
  return [...output.reasons, ...output.adjustments, ...output.uncertainties]
    .some(item => item.ruleCodes.some(code => !rules.has(code)));
};

const violatesDeterministicAuthority = (
  deterministic: TankCompatibilityResult,
  suggested: TankCompatibilityStatus,
) => {
  if (deterministic.blockingRules.length > 0) return suggested !== 'not_recommended';
  if (deterministic.metadata.domainStatus === 'not_recommended') return suggested !== 'not_recommended';
  if (deterministic.metadata.domainStatus === 'insufficient_data') return suggested !== 'insufficient_data';
  if (deterministic.metadata.domainStatus === 'caution') return suggested === 'compatible';
  return false;
};

const requiresActionableAdjustment = (deterministic: TankCompatibilityResult) => (
  deterministic.metadata.domainStatus === 'caution'
  || deterministic.metadata.domainStatus === 'not_recommended'
  || deterministic.blockingRules.length > 0
);

const tankSnapshot = (tank?: Aquarium | null) => {
  if (!tank) return null;
  return {
    waterType: tank.waterType,
    dimensions: tank.dimensions,
    targetTemperature: tank.targetTemperature,
  };
};

const RESOLUTION_CLAIM_PATTERN = /(风险.{0,4}(已)?(解除|消失|解决)|已经(可以|安全)|可以安全混养|安全混养|已解决|已解除|resolved|cleared|risk.{0,8}(gone|resolved)|safe to mix)/i;

const RESOLUTION_ACTION_PATTERNS: Record<CompatibilityResolutionTarget['resolutionMode'], RegExp> = {
  deterministic_clearance: /(分缸|分隔|隔离|更换|替换|移除|单养|不要.*同一缸|不再.*接触|不再.*同一水体|淡水|海水|separate|isolate|replace|remove|single)/i,
  parameter_recheck: /(调整|达到|增加|补足|减少|升级|温度|水温|pH|数量|空间|体积|长度|过滤|维护|重新评估|复查|adjust|increase|reduce|temperature|group|space|volume|filter|recheck)/i,
  behavioral_recheck: /(观察|复查|监测|遮挡|退让|追逐|受伤|破鳍|躲藏|进食|分隔|隔离|observe|monitor|recheck|chasing|injury|hiding|feeding|separate|isolate)/i,
  information_required: /(补齐|确认|核验|证据|身份|信息|资料|等待|verify|confirm|evidence|identity|information|complete)/i,
};

const relevantResolutionTargets = (
  item: { text: string; ruleCodes: string[] },
  targets: CompatibilityResolutionTarget[],
) => targets.filter(target => item.ruleCodes.includes(target.sourceRuleCode));

const violatesResolutionTargets = (
  output: CompatibilityAiProviderOutput,
  targets: CompatibilityResolutionTarget[] = [],
) => {
  if (targets.length === 0) return false;
  const items = [...output.reasons, ...output.adjustments, ...output.uncertainties];
  for (const item of items) {
    const relevant = relevantResolutionTargets(item, targets);
    if (relevant.some(target => target.resolutionMode === 'behavioral_recheck') && RESOLUTION_CLAIM_PATTERN.test(item.text)) {
      return true;
    }
  }
  for (const adjustment of output.adjustments) {
    const relevant = relevantResolutionTargets(adjustment, targets);
    if (relevant.length === 0) continue;
    if (relevant.some(target => !RESOLUTION_ACTION_PATTERNS[target.resolutionMode].test(adjustment.text))) {
      return true;
    }
  }
  return false;
};

const promptsFor = (
  input: CompatibilityAiCombinationInput,
  speciesFacts: NonNullable<ReturnType<typeof reviewedKnowledgeSnapshot>>[],
) => {
  const result = input.deterministicResult;
  const assessmentMode = assessmentModeFor(input);
  const finalDecision = getCompatibilityDecision(result, decisionIntentFor(assessmentMode));
  const primaryRules = primaryNarrativeRules(result, assessmentMode);
  const narrativeRuleCodes = primaryRules.map(rule => rule.code);
  const system = [
    'You are AquaGuide Compatibility V4 in SHADOW mode.',
    'You are not the final authority. Deterministic hard rules and reviewed pair authority remain final.',
    'Use ONLY facts, rules, evidence IDs and tank context included in INPUT. Do not use outside biological knowledge.',
    'Do not invent missing species facts, thresholds, group sizes, interactions, citations or evidence IDs.',
    'If INPUT says insufficient_data, suggestedVerdict must remain insufficient_data.',
    'If INPUT contains a hard/blocking rule or final verdict not_recommended, suggestedVerdict must remain not_recommended.',
    'If final verdict is caution, never upgrade it to compatible.',
    'Focus only on the supplied PRIMARY rules. Do not mention lower-priority risk families even if other species facts could suggest them.',
    'Return at most 3 concise primary reasons and at most 2 immediate actions.',
    'For caution or not_recommended decisions, adjustments MUST contain at least one grounded actionable item.',
    assessmentMode === 'current_tank'
      ? 'All listed items are already in the aquarium. Do not tell the user not to add a candidate. For not_recommended/caution, explain grounded actions for the current combination such as separate, reduce, adjust, confirm or monitor only when supported by supplied rules.'
      : 'For not_recommended, a valid action is to not add the candidate under the current plan, grounded in the blocking/conflict rule; do not invent a new threshold or biological fact.',
    'For caution, give at least one concrete mitigation directly supported by the supplied caution rule.',
    'resolutionTargets are deterministic constraints on what counts as progress; use them only to explain the next action or recheck criterion, never to claim the criterion is already satisfied.',
    'For behavioral_recheck targets, never say the risk is solved, cleared, safe, or resolved; explain what behavior must be monitored and when to separate/reassess.',
    'For deterministic_clearance targets, only describe structural separation/removal/replacement or the exact supplied clearance criterion. For parameter_recheck, describe the supplied measurable adjustment and re-evaluation.',
    'Every reason/adjustment/uncertainty must cite one or more ruleCodes from allowedRuleCodes. Do not cite or discuss any other rule.',
    'You may name a species only when the supplied primary rule identifies it via affectedSpeciesIds; use the exact supplied commonName mapping.',
    'Return one JSON object only.',
  ].join(' ');
  const user = JSON.stringify({
    task: assessmentMode === 'current_tank'
      ? 'Explain the current whole-tank compatibility state and grounded actions for species already present, without changing deterministic authority.'
      : 'Explain combination-level risk and actionable adjustments for the planned addition without changing deterministic authority.',
    assessmentMode,
    requiredOutput: {
      suggestedVerdict: 'compatible|caution|not_recommended|insufficient_data',
      reasons: [{ text: 'natural-language rewrite of a PRIMARY grounded risk; max 3 items', ruleCodes: ['exact_allowed_rule_code'] }],
      adjustments: [{ text: 'grounded immediate action; max 2 items', ruleCodes: ['exact_allowed_rule_code'] }],
      adjustmentRequirement: 'non-empty when deterministic finalDecision is caution or not_recommended',
      uncertainties: [{ text: 'grounded uncertainty', ruleCodes: ['exact_input_rule_code'] }],
      confidence: 'low|medium|high',
      evidenceIds: ['only exact evidence IDs supplied in INPUT'],
    },
    deterministicAuthority: {
      finalDecision,
      riskLevel: result.riskLevel,
      summary: result.summary,
      rules: primaryRules.map(rule => ({
        code: rule.code,
        title: rule.title,
        evidence: rule.evidence,
        severity: rule.severity,
        reviewStatus: rule.reviewStatus,
        confidence: rule.confidence,
        affectedSpeciesIds: rule.affectedSpeciesIds,
        evidenceIds: rule.citations.map(item => item.id),
      })),
    },
    tank: tankSnapshot(input.tank),
    species: speciesFacts,
    quantities: input.items.map(item => ({
      catalogKey: item.species.id,
      quantity: item.quantity,
      origin: item.origin,
      existingQuantity: item.existingQuantity ?? (item.origin === 'existing' ? item.quantity : 0),
      plannedQuantity: item.plannedQuantity ?? (item.origin === 'planned' ? item.quantity : 0),
    })),
    primaryRiskRuleCodes: narrativeRuleCodes,
    resolutionTargets: (input.resolutionTargets || [])
      .filter(target => narrativeRuleCodes.includes(target.sourceRuleCode))
      .slice(0, 2),
    allowedRuleCodes: narrativeRuleCodes,
    allowedEvidenceIds: [...allowedEvidenceIds(result)],
  }, null, 2);
  return { system, user };
};

export const compatibilityAiRequestExtrasForModel = (model: string) => textJsonRequestExtrasForModel(model);

export const buildCompatibilityAiModelPool = (
  primaryModel: string,
  fallbackModels: readonly string[] = [],
) => [...new Set([primaryModel, ...fallbackModels].map(model => model.trim()).filter(Boolean))];

export const shouldFallbackCompatibilityAiModel = (error: unknown) => (
  error instanceof ProviderError
  && (
    error.reason === 'quota_exhausted'
    || error.reason === 'access_denied'
    || error.reason === 'rate_limited'
    || error.reason === 'timeout'
    || error.reason === 'invalid_response'
    || (error.reason === 'network' && typeof error.statusCode === 'number')
  )
);

export const openAiCompatibleCompatibilityReasoningProvider: CompatibilityAiReasoningProvider = Object.assign(
  async ({ system, user }: { system: string; user: string }) => {
    const models = buildCompatibilityAiModelPool(
      apiConfig.compatibilityAiModel,
      apiConfig.compatibilityAiFallbackModels,
    );
    let lastError: unknown;

    for (let index = 0; index < models.length; index += 1) {
      const model = models[index]!;
      try {
        const output = await fetchJsonResponse(
          apiConfig.aiBaseUrl,
          apiConfig.aiApiKey,
          model,
          apiConfig.aiTimeoutMs,
          {
            stream: false,
            temperature: 0.1,
            max_tokens: 1200,
            ...compatibilityAiRequestExtrasForModel(model),
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
          },
          1,
        );
        return { model, output };
      } catch (error) {
        lastError = error;
        const hasFallback = index < models.length - 1;
        if (!hasFallback || !shouldFallbackCompatibilityAiModel(error)) throw error;
        const providerError = error instanceof ProviderError ? error : undefined;
        console.warn('Aqua Compatibility AI model fallback', {
          fromModel: model,
          toModel: models[index + 1],
          reason: providerError?.reason || 'unknown',
          statusCode: providerError?.statusCode,
        });
      }
    }

    throw lastError instanceof Error ? lastError : new ProviderError('not_configured', 'No Compatibility AI model is configured.');
  },
  { readiness: getCompatibilityAiProviderReadiness },
);

const emptyAi = (
  status: CompatibilityAiShadowResult['ai']['status'],
  reason: string,
): CompatibilityAiShadowResult['ai'] => ({
  status,
  reason,
  reasons: [],
  adjustments: [],
  uncertainties: [],
});

export const createCompatibilityAiCombinationAssessment = async (
  input: CompatibilityAiCombinationInput,
  provider: CompatibilityAiReasoningProvider = openAiCompatibleCompatibilityReasoningProvider,
): Promise<CompatibilityAiShadowResult> => {
  const assessmentMode = assessmentModeFor(input);
  const finalDecision = getCompatibilityDecision(input.deterministicResult, decisionIntentFor(assessmentMode));
  const baseProvenance = {
    promptVersion: COMPATIBILITY_AI_PROMPT_VERSION,
    authorityVersion: input.deterministicResult.metadata.authorityVersion,
    catalogVersion: input.deterministicResult.metadata.catalogVersion,
    ruleVersion: input.deterministicResult.metadata.ruleVersion,
    evidenceIds: [...allowedEvidenceIds(input.deterministicResult)],
    repairCount: 0,
  };

  if (input.deterministicResult.metadata.decisionReadiness !== 'reviewed') {
    return {
      mode: 'shadow',
      finalDecision,
      ai: emptyAi('skipped', 'deterministic_decision_not_fully_reviewed'),
      provenance: baseProvenance,
    };
  }

  const species = input.items.map(item => item.species);
  const speciesFacts = species.map(reviewedKnowledgeSnapshot);

  const providerReadiness = provider.readiness?.();
  if (providerReadiness && !providerReadiness.configured) {
    return {
      mode: 'shadow',
      finalDecision,
      ai: emptyAi('unavailable', 'not_configured'),
      provenance: { ...baseProvenance, model: providerReadiness.model },
    };
  }

  try {
    const { system, user } = promptsFor(input, speciesFacts);
    let providerResult = await provider({ system, user });
    let parsed = compatibilityAiProviderOutputSchema.safeParse(providerResult.output);
    let repairCount = 0;

    const repair = async (reason: string) => {
      repairCount += 1;
      providerResult = await provider({
        system: [
          system,
          'REPAIR PASS: Correct only format/required-action defects. Keep the same supplied authority and do not add outside knowledge.',
          reason,
          'Return exactly one JSON object with suggestedVerdict, reasons, adjustments, uncertainties, confidence, evidenceIds and no extra keys.',
        ].join(' '),
        user,
      });
      parsed = compatibilityAiProviderOutputSchema.safeParse(providerResult.output);
    };

    if (!parsed.success) {
      await repair('The previous response did not match the exact required JSON schema.');
      if (!parsed.success) {
        return {
          mode: 'shadow',
          finalDecision,
          ai: emptyAi('rejected', 'provider_output_schema_invalid'),
          provenance: { ...baseProvenance, model: providerResult.model, repairCount },
        };
      }
    }

    let output = parsed.data;
    if (hasUnknownGrounding(output, allowedNarrativeRuleCodes(input.deterministicResult, assessmentMode), allowedEvidenceIds(input.deterministicResult))) {
      return {
        mode: 'shadow',
        finalDecision,
        ai: emptyAi('rejected', 'provider_output_uses_unknown_authority'),
        provenance: { ...baseProvenance, model: providerResult.model, repairCount },
      };
    }
    if (violatesDeterministicAuthority(input.deterministicResult, output.suggestedVerdict)) {
      return {
        mode: 'shadow',
        finalDecision,
        ai: emptyAi('rejected', 'provider_output_conflicts_with_deterministic_authority'),
        provenance: { ...baseProvenance, model: providerResult.model, repairCount },
      };
    }
    if (violatesResolutionTargets(output, input.resolutionTargets)) {
      return {
        mode: 'shadow',
        finalDecision,
        ai: emptyAi('rejected', 'provider_output_conflicts_with_resolution_target'),
        provenance: { ...baseProvenance, model: providerResult.model, repairCount },
      };
    }

    if (requiresActionableAdjustment(input.deterministicResult) && output.adjustments.length === 0 && repairCount === 0) {
      await repair('The previous JSON omitted the required actionable adjustment for a caution/not_recommended decision.');
      if (!parsed.success) {
        return {
          mode: 'shadow',
          finalDecision,
          ai: emptyAi('rejected', 'provider_output_schema_invalid'),
          provenance: { ...baseProvenance, model: providerResult.model, repairCount },
        };
      }
      output = parsed.data;
      if (hasUnknownGrounding(output, allowedNarrativeRuleCodes(input.deterministicResult, assessmentMode), allowedEvidenceIds(input.deterministicResult))) {
        return {
          mode: 'shadow',
          finalDecision,
          ai: emptyAi('rejected', 'provider_output_uses_unknown_authority'),
          provenance: { ...baseProvenance, model: providerResult.model, repairCount },
        };
      }
      if (violatesDeterministicAuthority(input.deterministicResult, output.suggestedVerdict)) {
        return {
          mode: 'shadow',
          finalDecision,
          ai: emptyAi('rejected', 'provider_output_conflicts_with_deterministic_authority'),
          provenance: { ...baseProvenance, model: providerResult.model, repairCount },
        };
      }
      if (violatesResolutionTargets(output, input.resolutionTargets)) {
        return {
          mode: 'shadow',
          finalDecision,
          ai: emptyAi('rejected', 'provider_output_conflicts_with_resolution_target'),
          provenance: { ...baseProvenance, model: providerResult.model, repairCount },
        };
      }
    }

    if (requiresActionableAdjustment(input.deterministicResult) && output.adjustments.length === 0) {
      return {
        mode: 'shadow',
        finalDecision,
        ai: emptyAi('rejected', 'provider_output_missing_actionable_adjustment'),
        provenance: { ...baseProvenance, model: providerResult.model, repairCount },
      };
    }

    return {
      mode: 'shadow',
      finalDecision,
      ai: {
        status: 'accepted',
        suggestedVerdict: output.suggestedVerdict,
        reasons: output.reasons,
        adjustments: output.adjustments,
        uncertainties: output.uncertainties,
        confidence: output.confidence,
      },
      provenance: { ...baseProvenance, model: providerResult.model, repairCount },
    };
  } catch (error) {
    const reason = error instanceof ProviderError ? error.reason : 'provider_failure';
    return {
      mode: 'shadow',
      finalDecision,
      ai: emptyAi('unavailable', reason),
      provenance: baseProvenance,
    };
  }
};

export const createCompatibilityAiShadowAssessment = async (
  input: CompatibilityAiShadowInput,
  provider: CompatibilityAiReasoningProvider = openAiCompatibleCompatibilityReasoningProvider,
): Promise<CompatibilityAiShadowResult> => createCompatibilityAiCombinationAssessment({
  deterministicResult: input.deterministicResult,
  tank: input.tank,
  assessmentMode: 'planned_addition',
  items: [
    ...input.existingSpecies.map(item => ({
      species: item.species,
      quantity: item.quantity,
      origin: 'existing' as const,
      existingQuantity: item.quantity,
      plannedQuantity: 0,
    })),
    {
      species: input.candidateSpecies,
      quantity: input.candidateQuantity || 1,
      origin: 'planned' as const,
      existingQuantity: 0,
      plannedQuantity: input.candidateQuantity || 1,
    },
  ],
}, provider);
