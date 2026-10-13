import {
  createCompatibilityAiShadowAssessment,
  getCompatibilityAiProviderReadiness,
  openAiCompatibleCompatibilityReasoningProvider,
  type CompatibilityAiReasoningProvider,
} from '../apps/api/src/compatibility-ai-reasoner';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateTankCompatibility } from '../src/services/compatibility/compatibility.service';
import type { Aquarium, Fish } from '../src/types';

type CanaryFixture = {
  caseId: string;
  ids: [string, string, string];
};

export type CompatibilityV4LiveCanaryCase = {
  caseId: string;
  species: Array<{ id: string; name: string; role: 'existing' | 'candidate'; quantity: number }>;
  deterministic: {
    status: string;
    decisionReadiness: string;
    ruleCodes: string[];
  };
  ai: {
    status: string;
    reason: string | null;
    suggestedVerdict: string | null;
    confidence: string | null;
    reasons: Array<{ text: string; ruleCodes: string[] }>;
    adjustments: Array<{ text: string; ruleCodes: string[] }>;
    uncertainties: Array<{ text: string; ruleCodes: string[] }>;
    model: string | null;
    repairCount: number;
    providerCalls: number;
  };
  latencyMs: number;
  finalDecision: {
    status: string;
    unchanged: boolean;
  };
};

export type CompatibilityV4LiveCanaryReport = {
  schemaVersion: 1;
  mode: 'live-provider-canary';
  generatedAt: string;
  provider: {
    configured: boolean;
    host: string | null;
    model: string;
    fallbackModels: string[];
    timeoutMs: number;
  };
  outcome:
    | 'pass_guarded'
    | 'blocked_not_configured'
    | 'blocked_provider_quota'
    | 'blocked_provider_access'
    | 'blocked_provider_rate_limit'
    | 'fail_authority_mutation'
    | 'fail_provider_unavailable'
    | 'fail_model_quality';
  cases: CompatibilityV4LiveCanaryCase[];
  summary: {
    totalCases: number;
    providerCalls: number;
    acceptedAi: number;
    rejectedAi: number;
    unavailableAi: number;
    skippedAi: number;
    acceptedReviewedCases: number;
    finalDecisionMutations: number;
    modelsUsed: string[];
    reviewedCasesWithReasons: number;
    reviewedRiskCasesWithAdjustments: number;
  };
};

const tank: Aquarium = {
  id: 'compatibility-v4-live-canary',
  name: 'Compatibility V4 Live Canary',
  fishes: [],
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};

const fixtures: CanaryFixture[] = [
  { caseId: 'V4-LIVE-3SP-COMPATIBLE', ids: ['sp_0114', 'sp_0469', 'sp_0012'] },
  { caseId: 'V4-LIVE-3SP-CAUTION', ids: ['sp_0114', 'sp_0469', 'sp_0013'] },
  { caseId: 'V4-LIVE-3SP-BLOCKED', ids: ['sp_0199', 'sp_0200', 'sp_0448'] },
  { caseId: 'V4-LIVE-3SP-INSUFFICIENT', ids: ['sp_0114', 'sp_0469', 'sp_0112'] },
];

const getFish = (id: string): Fish => {
  const fish = fishData.find(item => item.id === id);
  if (!fish) throw new Error('Missing Compatibility V4 live canary species ' + id);
  return fish;
};

const quantityFor = (fish: Fish) => Math.max(1, getReviewedCompatibilityProfile(fish.id)?.minimumGroupSize || 1);

type CanaryOptions = {
  provider?: CompatibilityAiReasoningProvider;
  providerConfigured?: boolean;
  generatedAt?: string;
};

export const runCompatibilityV4LiveCanary = async (
  options: CanaryOptions = {},
): Promise<CompatibilityV4LiveCanaryReport> => {
  const readiness = getCompatibilityAiProviderReadiness();
  const providerConfigured = options.providerConfigured ?? readiness.configured;
  const cases: CompatibilityV4LiveCanaryCase[] = [];

  for (const fixture of fixtures) {
    const species = fixture.ids.map(getFish);
    const quantities = species.map(quantityFor);
    const deterministic = evaluateTankCompatibility({
      tank,
      existingSpecies: [
        { species: species[0], record: { quantity: quantities[0] } },
        { species: species[1], record: { quantity: quantities[1] } },
      ],
      candidateSpecies: species[2],
      candidateQuantity: quantities[2],
      intent: 'planned_addition',
    });

    let providerCalls = 0;
    const baseProvider = options.provider || openAiCompatibleCompatibilityReasoningProvider;
    const measuredProvider: CompatibilityAiReasoningProvider = Object.assign(
      async (input: { system: string; user: string }) => {
        providerCalls += 1;
        return baseProvider(input);
      },
      baseProvider.readiness ? { readiness: baseProvider.readiness } : {},
    );

    const assessmentInput = {
      deterministicResult: deterministic,
      tank,
      existingSpecies: [
        { species: species[0], quantity: quantities[0] },
        { species: species[1], quantity: quantities[1] },
      ],
      candidateSpecies: species[2],
      candidateQuantity: quantities[2],
    };
    const startedAt = performance.now();
    const shadow = await createCompatibilityAiShadowAssessment(assessmentInput, measuredProvider);
    const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));

    cases.push({
      caseId: fixture.caseId,
      species: species.map((item, index) => ({
        id: item.id,
        name: item.name,
        role: index === 2 ? 'candidate' : 'existing',
        quantity: quantities[index],
      })),
      deterministic: {
        status: deterministic.status,
        decisionReadiness: deterministic.metadata.decisionReadiness,
        ruleCodes: deterministic.metadata.domainRuleCodes,
      },
      ai: {
        status: shadow.ai.status,
        reason: shadow.ai.reason || null,
        suggestedVerdict: shadow.ai.suggestedVerdict || null,
        confidence: shadow.ai.confidence || null,
        reasons: shadow.ai.reasons,
        adjustments: shadow.ai.adjustments,
        uncertainties: shadow.ai.uncertainties,
        model: shadow.provenance.model || null,
        repairCount: shadow.provenance.repairCount,
        providerCalls,
      },
      latencyMs,
      finalDecision: {
        status: shadow.finalDecision.status,
        unchanged: shadow.finalDecision.status === deterministic.status,
      },
    });
  }

  const summary = {
    totalCases: cases.length,
    providerCalls: cases.reduce((sum, item) => sum + item.ai.providerCalls, 0),
    acceptedAi: cases.filter(item => item.ai.status === 'accepted').length,
    rejectedAi: cases.filter(item => item.ai.status === 'rejected').length,
    unavailableAi: cases.filter(item => item.ai.status === 'unavailable').length,
    skippedAi: cases.filter(item => item.ai.status === 'skipped').length,
    acceptedReviewedCases: cases.filter(item => (
      item.deterministic.decisionReadiness === 'reviewed' && item.ai.status === 'accepted'
    )).length,
    finalDecisionMutations: cases.filter(item => !item.finalDecision.unchanged).length,
    modelsUsed: [...new Set(cases.map(item => item.ai.model).filter((model): model is string => Boolean(model)))],
    reviewedCasesWithReasons: cases.filter(item => (
      item.deterministic.decisionReadiness === 'reviewed'
      && item.ai.status === 'accepted'
      && item.ai.reasons.length > 0
    )).length,
    reviewedRiskCasesWithAdjustments: cases.filter(item => (
      item.deterministic.decisionReadiness === 'reviewed'
      && (item.deterministic.status === 'caution' || item.deterministic.status === 'not_recommended')
      && item.ai.status === 'accepted'
      && item.ai.adjustments.length > 0
    )).length,
  };

  const unavailableReasons = new Set(
    cases
      .filter(item => item.ai.status === 'unavailable')
      .map(item => item.ai.reason)
      .filter((reason): reason is string => Boolean(reason)),
  );

  let outcome: CompatibilityV4LiveCanaryReport['outcome'];
  if (summary.finalDecisionMutations > 0) outcome = 'fail_authority_mutation';
  else if (!providerConfigured) outcome = 'blocked_not_configured';
  else if (unavailableReasons.has('quota_exhausted')) outcome = 'blocked_provider_quota';
  else if (unavailableReasons.has('access_denied')) outcome = 'blocked_provider_access';
  else if (unavailableReasons.has('rate_limited')) outcome = 'blocked_provider_rate_limit';
  else if (summary.unavailableAi > 0) outcome = 'fail_provider_unavailable';
  else if (summary.acceptedReviewedCases < 3) outcome = 'fail_model_quality';
  else if (summary.reviewedCasesWithReasons < 3) outcome = 'fail_model_quality';
  else if (summary.reviewedRiskCasesWithAdjustments < 2) outcome = 'fail_model_quality';
  else outcome = 'pass_guarded';

  return {
    schemaVersion: 1,
    mode: 'live-provider-canary',
    generatedAt: options.generatedAt || new Date().toISOString(),
    provider: {
      configured: providerConfigured,
      host: readiness.host,
      model: readiness.model,
      fallbackModels: readiness.fallbackModels,
      timeoutMs: readiness.timeoutMs,
    },
    outcome,
    cases,
    summary,
  };
};
