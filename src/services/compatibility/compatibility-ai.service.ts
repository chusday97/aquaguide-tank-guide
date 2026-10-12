import {
  compatibilityAiReasoningSchema,
  type CompatibilityAiReasoning,
  type CompatibilityAiReasoningRequest,
  type CompatibilityAiSpeciesFact,
  type CompatibilityAiVerdict,
} from '../../../packages/contracts/src';
import type { Aquarium, Fish } from '../../types';
import { getReviewedSpeciesKnowledgeForFish } from '../../modules/knowledge/speciesKnowledge';
import { apiRequest } from '../api/api-client';
import {
  evaluateSpeciesCombination,
  evaluateTankCompatibility,
  type EvaluateTankCompatibilityInput,
  type TankCompatibilityResult,
} from './compatibility.service';

export type CompatibilityAiReasoner = (
  request: CompatibilityAiReasoningRequest,
) => Promise<CompatibilityAiReasoning>;

export type CompatibilityAiSpeciesInput = { fish: Fish; quantity: number };

export type AiAssistedCompatibilityResult = CompatibilityAiReasoning & {
  deterministic: TankCompatibilityResult;
};

const AI_RESOLVABLE_MISSING_CODES = new Set([
  'behavior_evidence_unreviewed',
  'species_evidence_unreviewed',
]);

const verdictRank: Record<CompatibilityAiVerdict, number> = {
  compatible: 0,
  caution: 1,
  insufficient_data: 2,
  not_recommended: 3,
};

const maxVerdict = (left: CompatibilityAiVerdict, right: CompatibilityAiVerdict) => (
  verdictRank[left] >= verdictRank[right] ? left : right
);

const defaultReasoner: CompatibilityAiReasoner = (request) => apiRequest<CompatibilityAiReasoning>(
  '/ai/compatibility-reason',
  {
    method: 'POST',
    body: request,
    authenticated: 'optional',
    signal: AbortSignal.timeout(8_000),
  },
);

const getQuantity = (value?: number) => (
  Number.isFinite(value) && Number(value) > 0 ? Math.max(1, Math.floor(Number(value))) : 1
);

const tankVolumeLiters = (tank?: Aquarium | null) => {
  if (!tank?.dimensions) return null;
  const length = Number(tank.dimensions.length);
  const width = Number(tank.dimensions.width);
  const height = Number(tank.dimensions.height);
  if (![length, width, height].every(value => Number.isFinite(value) && value > 0)) return null;
  return (length * width * height) / 1000;
};

const toTankContext = (tank?: Aquarium | null): CompatibilityAiReasoningRequest['tank'] => {
  if (!tank) return null;
  const length = tank.dimensions ? Number(tank.dimensions.length) : NaN;
  const targetTemperature = tank.targetTemperature ? Number(tank.targetTemperature) : NaN;
  return {
    waterType: tank.waterType === 'Freshwater'
      ? 'freshwater'
      : tank.waterType === 'Saltwater' ? 'saltwater' : 'unknown',
    volumeLiters: tankVolumeLiters(tank),
    lengthCm: Number.isFinite(length) && length > 0 ? length : null,
    targetTemperatureC: Number.isFinite(targetTemperature) ? targetTemperature : null,
    substrate: tank.substrate?.trim() || null,
    plantCount: tank.plants?.length || 0,
    hardscapeCount: tank.hardscape?.length || 0,
  };
};

const reviewedFactFor = (fish: Fish, quantity: number): CompatibilityAiSpeciesFact | null => {
  const reviewedKnowledge = getReviewedSpeciesKnowledgeForFish(fish);
  const environment = reviewedKnowledge?.environment;
  const socialBehavior = reviewedKnowledge?.socialBehavior;
  const spaceAndGrowth = reviewedKnowledge?.spaceAndGrowth;

  const blocks = [environment, socialBehavior, spaceAndGrowth];
  if (blocks.some(block => (
    !block
    || block.evidence.reviewStatus !== 'reviewed'
    || block.evidence.sourceIds.length === 0
  ))) return null;

  return {
    speciesId: fish.id,
    name: fish.name,
    scientificName: fish.scientificName,
    quantity,
    environment: {
      ...(environment!.waterType ? { waterType: environment!.waterType } : {}),
      ...(environment!.waterTypes ? { waterTypes: environment!.waterTypes } : {}),
      ...(environment!.temperatureRangeC ? { temperatureRangeC: environment!.temperatureRangeC } : {}),
      ...(environment!.phRange ? { phRange: environment!.phRange } : {}),
      ...(environment!.hardnessDgh ? { hardnessDgh: environment!.hardnessDgh } : {}),
      ...(environment!.notes?.length ? { notes: environment!.notes } : {}),
      evidenceIds: [...environment!.evidence.sourceIds],
    },
    socialBehavior: {
      mode: socialBehavior!.mode,
      ...(socialBehavior!.minimumGroupSize ? { minimumGroupSize: socialBehavior!.minimumGroupSize } : {}),
      ...(socialBehavior!.recommendedGroupSize ? { recommendedGroupSize: socialBehavior!.recommendedGroupSize } : {}),
      ...(socialBehavior!.swimmingZone ? { swimmingZone: socialBehavior!.swimmingZone } : {}),
      ...(socialBehavior!.territoriality ? { territoriality: socialBehavior!.territoriality } : {}),
      ...(socialBehavior!.finNipping ? { finNipping: socialBehavior!.finNipping } : {}),
      ...(socialBehavior!.finNipVulnerability ? { finNipVulnerability: socialBehavior!.finNipVulnerability } : {}),
      ...(socialBehavior!.swimmingPace ? { swimmingPace: socialBehavior!.swimmingPace } : {}),
      ...(socialBehavior!.predationRisk ? { predationRisk: socialBehavior!.predationRisk } : {}),
      ...(socialBehavior!.predationVulnerability ? { predationVulnerability: socialBehavior!.predationVulnerability } : {}),
      summary: socialBehavior!.summary,
      evidenceIds: [...socialBehavior!.evidence.sourceIds],
    },
    spaceAndGrowth: {
      ...(spaceAndGrowth!.adultLengthCm ? { adultLengthCm: spaceAndGrowth!.adultLengthCm } : {}),
      ...(spaceAndGrowth!.minVolumeLiters ? { minVolumeLiters: spaceAndGrowth!.minVolumeLiters } : {}),
      ...(spaceAndGrowth!.minTankLengthCm ? { minTankLengthCm: spaceAndGrowth!.minTankLengthCm } : {}),
      ...(spaceAndGrowth!.activityLevel ? { activityLevel: spaceAndGrowth!.activityLevel } : {}),
      ...(spaceAndGrowth!.swimmingZone ? { swimmingZone: spaceAndGrowth!.swimmingZone } : {}),
      ...(spaceAndGrowth!.needsCover !== undefined ? { needsCover: spaceAndGrowth!.needsCover } : {}),
      ...(spaceAndGrowth!.needsHidingPlaces !== undefined ? { needsHidingPlaces: spaceAndGrowth!.needsHidingPlaces } : {}),
      ...(spaceAndGrowth!.substrateNotes?.length ? { substrateNotes: spaceAndGrowth!.substrateNotes } : {}),
      ...(spaceAndGrowth!.spaceNotes?.length ? { spaceNotes: spaceAndGrowth!.spaceNotes } : {}),
      evidenceIds: [...spaceAndGrowth!.evidence.sourceIds],
    },
  };
};

const normalizedSpeciesFromTankInput = (input: EvaluateTankCompatibilityInput) => {
  const map = new Map<string, { fish: Fish; quantity: number }>();
  for (const item of input.existingSpecies || []) {
    if (!item || typeof item !== 'object') continue;
    const fish = 'species' in item ? item.species : item as Fish;
    if (!fish?.id) continue;
    const quantity = 'species' in item ? getQuantity(item.record?.quantity) : 1;
    const existing = map.get(fish.id);
    map.set(fish.id, { fish, quantity: (existing?.quantity || 0) + quantity });
  }
  if (input.candidateSpecies?.id) {
    const existing = map.get(input.candidateSpecies.id);
    map.set(input.candidateSpecies.id, {
      fish: input.candidateSpecies,
      quantity: (existing?.quantity || 0) + getQuantity(input.candidateQuantity),
    });
  }
  return Array.from(map.values());
};

const hasExplicitReviewedPairRule = (result: TankCompatibilityResult) => (
  [
    ...result.passedRules,
    ...result.warningRules,
    ...result.blockingRules,
    ...result.missingData,
  ].some(rule => rule.basis === 'pair_rule')
);

const deterministicReasoning = (
  result: TankCompatibilityResult,
  speciesIds: string[],
  mode: 'deterministic_only' | 'fallback',
  reason?: string,
): AiAssistedCompatibilityResult => ({
  verdict: result.status,
  reasons: [reason || result.summary || '当前结论由确定性兼容性规则给出。'],
  adjustments: result.suggestions.slice(0, 6),
  uncertainties: result.missingData.map(item => item.evidence).filter(Boolean).slice(0, 6),
  confidence: result.status === 'not_recommended' ? 'high' : result.status === 'insufficient_data' ? 'unknown' : 'medium',
  evidenceIds: Array.from(new Set(result.evidenceIds || [])).slice(0, 80),
  provenance: {
    mode,
    authorityVersion: result.metadata.authorityVersion,
    speciesIds,
  },
  deterministic: result,
});

const fallbackReasoning = (
  result: TankCompatibilityResult,
  speciesIds: string[],
  reason: string,
): AiAssistedCompatibilityResult => {
  if (result.status === 'not_recommended') return deterministicReasoning(result, speciesIds, 'deterministic_only');
  return {
    ...deterministicReasoning(result, speciesIds, 'fallback', reason),
    verdict: maxVerdict(result.status, 'insufficient_data'),
    confidence: 'unknown',
  };
};

export const resolveCompatibilityResultWithAi = async (
  deterministic: TankCompatibilityResult,
  speciesWithQuantity: CompatibilityAiSpeciesInput[],
  tank: Aquarium | null | undefined,
  reasoner: CompatibilityAiReasoner = defaultReasoner,
): Promise<AiAssistedCompatibilityResult> => {
  const speciesIds = speciesWithQuantity.map(item => item.fish.id);

  if (deterministic.blockingRules.length > 0 || deterministic.status === 'not_recommended') {
    return deterministicReasoning(deterministic, speciesIds, 'deterministic_only');
  }

  if (hasExplicitReviewedPairRule(deterministic)) {
    return deterministicReasoning(
      deterministic,
      speciesIds,
      'deterministic_only',
      deterministic.summary || '存在已审核的直接配对规则；AI 不覆盖该结论。',
    );
  }

  if (speciesWithQuantity.length < 2) {
    return deterministicReasoning(deterministic, speciesIds, 'deterministic_only');
  }

  const nonAiResolvableMissing = deterministic.missingData.filter(
    item => !AI_RESOLVABLE_MISSING_CODES.has(item.code),
  );
  if (nonAiResolvableMissing.length > 0) {
    return deterministicReasoning(
      deterministic,
      speciesIds,
      'deterministic_only',
      deterministic.summary || '仍有必须由确定性资料补齐的缺失项。',
    );
  }

  const facts = speciesWithQuantity.map(item => reviewedFactFor(item.fish, item.quantity));
  if (facts.some(fact => !fact)) {
    return fallbackReasoning(
      deterministic,
      speciesIds,
      '至少一个物种缺少 reviewed environment / social / space 事实，AI 不进行猜测。',
    );
  }

  const reviewedFacts = facts as CompatibilityAiSpeciesFact[];
  const allowedEvidenceIds = Array.from(new Set(
    reviewedFacts.flatMap(fact => [
      ...fact.environment.evidenceIds,
      ...fact.socialBehavior.evidenceIds,
      ...fact.spaceAndGrowth.evidenceIds,
    ]),
  ));

  const request: CompatibilityAiReasoningRequest = {
    tank: toTankContext(tank),
    species: reviewedFacts,
    deterministic: {
      status: deterministic.status,
      blockingRuleCodes: deterministic.blockingRules.map(rule => rule.code),
      warningRuleCodes: deterministic.warningRules.map(rule => rule.code),
      missingDataCodes: deterministic.missingData.map(rule => rule.code),
      passedRuleCodes: deterministic.passedRules.map(rule => rule.code),
    },
    allowedEvidenceIds,
    authorityVersion: deterministic.metadata.authorityVersion,
  };

  try {
    const raw = await reasoner(request);
    const parsed = compatibilityAiReasoningSchema.safeParse(raw);
    if (!parsed.success) {
      return fallbackReasoning(deterministic, speciesIds, 'AI 返回格式无效，已回退为资料不足。');
    }
    const allowed = new Set(allowedEvidenceIds);
    if (parsed.data.evidenceIds.some(id => !allowed.has(id))) {
      return fallbackReasoning(deterministic, speciesIds, 'AI 引用了未提供的证据，已拒绝该结果并回退。');
    }

    const ai = parsed.data;
    const finalVerdict = deterministic.status === 'insufficient_data'
      ? ai.verdict
      : maxVerdict(deterministic.status, ai.verdict);

    return {
      ...ai,
      verdict: finalVerdict,
      provenance: {
        mode: 'ai_assisted',
        ...(ai.provenance.model ? { model: ai.provenance.model } : {}),
        authorityVersion: deterministic.metadata.authorityVersion,
        speciesIds,
      },
      deterministic,
    };
  } catch {
    return fallbackReasoning(deterministic, speciesIds, '兼容性 AI 暂时不可用，已回退为资料不足。');
  }
};

export const evaluateTankCompatibilityWithAi = async (
  input: EvaluateTankCompatibilityInput,
  reasoner: CompatibilityAiReasoner = defaultReasoner,
): Promise<AiAssistedCompatibilityResult> => {
  const deterministic = evaluateTankCompatibility(input);
  return resolveCompatibilityResultWithAi(
    deterministic,
    normalizedSpeciesFromTankInput(input),
    input.tank,
    reasoner,
  );
};

export const evaluateSpeciesCombinationWithAi = async (
  species: Fish[],
  reasoner: CompatibilityAiReasoner = defaultReasoner,
): Promise<AiAssistedCompatibilityResult> => {
  const unique = Array.from(new Map(species.filter(item => item?.id).map(item => [item.id, item])).values());
  const deterministic = evaluateSpeciesCombination(unique);
  return resolveCompatibilityResultWithAi(
    deterministic,
    unique.map(fish => ({ fish, quantity: 1 })),
    null,
    reasoner,
  );
};
