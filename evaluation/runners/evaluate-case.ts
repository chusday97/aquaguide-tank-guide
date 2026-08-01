import { performance } from 'node:perf_hooks';
import {
  buildLocalTankCopilotFallback,
  sanitizeTankCopilotResponse,
  type CopilotResponseCore,
} from '../../src/modules/copilot/copilot.policy';
import type { CandidateSummary, TankCopilotContext } from '../../src/modules/copilot/copilot.types';
import {
  generateTankBuildCopilot,
  generateTankDailyCheckInterpretation,
  sanitizeTankDailyCheckInterpretation,
} from '../../src/lib/aiClient';
import { buildDiagnosisResult } from '../../src/modules/diagnosis/diagnosis.rules';
import type { TankDailyCheckContext, TankDailyCheckInterpretation } from '../../src/modules/diagnosis/diagnosis.types';
import { buildSpeciesDiagnosisStep, parseLocalSymptomObservations } from '../../packages/domain-rules/src/index';
import type { SpeciesDiagnosisStepInput } from '../../packages/contracts/src/index';
import { fishData } from '../../src/data/fishData';
import {
  buildSpeciesDiagnosisContextAnswers,
  isSpeciesEligibleForHealthTriage,
  mapVisionCandidateToCatalog,
} from '../../src/lib/speciesRecognition';
import type { Aquarium } from '../../src/types';
import type { EvaluationCase, EvaluationResult } from '../schemas/evaluation-case.schema';

type Actual = {
  source: EvaluationResult['source'];
  ruleStatus?: string;
  behaviors: string[];
  actions: string[];
  failureReason?: string;
  safeSummary?: Record<string, unknown>;
};

const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

const candidate = (speciesId: string, status: CandidateSummary['status'] = 'compatible'): CandidateSummary => ({
  speciesId,
  name: speciesId,
  status,
  recommendedQuantity: 3,
  reason: '本地规则候选。',
});

const makeCopilotContext = (input: Record<string, unknown>): TankCopilotContext => {
  const safeIds = strings(input.safeCandidateIds).length ? strings(input.safeCandidateIds) : ['safe-1'];
  const adjustableIds = strings(input.adjustableCandidateIds).length ? strings(input.adjustableCandidateIds) : ['adjustable-1'];
  return {
    goal: typeof input.goal === 'string' ? input.goal : '新手淡水小缸',
    answers: record(input.answers) as Record<string, string>,
    aquariumSummary: {
      id: 'tank-eval',
      name: '评测鱼缸',
      waterType: 'Freshwater',
      volumeLiters: 30,
      sizeCm: { length: '40', width: '25', height: '30' },
      targetTemperature: '25',
      equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
      livestockCount: 0,
      livestock: [],
    },
    missingInformation: strings(input.missingInformation),
    safeCandidates: input.noCandidates ? [] : safeIds.map(id => candidate(id)),
    adjustableCandidates: input.noCandidates ? [] : adjustableIds.map(id => candidate(id, 'caution')),
    blockedReasons: strings(input.blockedReasons),
    ruleVersion: 'tank-compatibility-v1',
  };
};

const baseCopilotModel = (input: Record<string, unknown>): CopilotResponseCore => ({
  goalUnderstanding: '模型理解了建缸目标。',
  missingQuestions: Array.isArray(input.questions) ? input.questions as CopilotResponseCore['missingQuestions'] : [],
  planSummary: '先查看本地规则候选，再进入模拟添加。',
  recommendedActions: Array.isArray(input.modelActions)
    ? input.modelActions as CopilotResponseCore['recommendedActions']
    : [{ type: 'view_safe_candidates', label: '任意模型文案' }],
  selectedCandidateIds: strings(input.selectedCandidateIds).length ? strings(input.selectedCandidateIds) : ['safe-1'],
  blockedExplanation: strings(input.modelBlockedExplanation),
});

const response = (body: unknown, status = 200) => new Response(
  typeof body === 'string' ? body : JSON.stringify(body),
  { status, headers: { 'Content-Type': 'application/json' } },
);

const withMockFetch = async <T>(scenario: string, task: 'build_tank_copilot' | 'tank_daily_check_interpretation', data: Record<string, unknown>, action: () => Promise<T>) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    if (scenario === 'network') throw new TypeError('Failed to fetch');
    if (scenario === 'timeout') throw new DOMException('Timed out', 'AbortError');
    if (scenario === 'not_configured') return response({ ok: false, error: 'AI provider not configured' }, 503);
    if (scenario === 'invalid_json') return response('not-json');
    if (scenario === 'wrong_task') return response({ ok: true, task: 'wrong_task', data: {} });
    if (scenario === 'invalid_structure') return response({ ok: true, task, data: null });
    return response({ ok: true, task, data });
  };
  try {
    return await action();
  } finally {
    globalThis.fetch = originalFetch;
  }
};

const evaluateCopilot = async (testCase: EvaluationCase): Promise<Actual> => {
  const input = testCase.input;
  const context = makeCopilotContext(input);
  const operation = String(input.operation || 'fallback');
  const model = baseCopilotModel(input);
  const result = operation === 'sanitize'
    ? sanitizeTankCopilotResponse(model, context)
    : operation === 'provider'
      ? await withMockFetch(String(input.providerScenario || 'success'), 'build_tank_copilot', model as unknown as Record<string, unknown>, () => generateTankBuildCopilot(context))
      : buildLocalTankCopilotFallback(context);
  const selected = result.selectedCandidateIds;
  const allowed = new Set([...context.safeCandidates, ...context.adjustableCandidates].map(item => item.speciesId));
  const actionTypes = result.recommendedActions.map(item => item.type);
  const questionKeys = result.missingQuestions.map(item => item.informationKey);
  const meta = result as { source?: unknown; failureReason?: unknown };
  const source = meta.source === 'model' || meta.source === 'fallback' ? meta.source : 'rules';
  const failureReason = typeof meta.failureReason === 'string' ? meta.failureReason : undefined;
  const behaviors = [
    ...selected.map(id => `selected:${id}`),
    ...questionKeys.map(key => `question:${key}`),
    ...(selected.every(id => allowed.has(id)) ? ['candidate_pool_respected'] : ['includes_out_of_pool_candidate']),
    ...(new Set(actionTypes).size === actionTypes.length ? ['deduplicates_actions'] : ['duplicate_action']),
    ...(result.missingQuestions.length <= 3 ? ['max_3_questions'] : []),
    ...(selected.length <= 6 ? ['max_6_candidates'] : []),
    ...(context.blockedReasons.every(reason => result.blockedExplanation.includes(reason)) ? ['blocked_reasons_preserved'] : []),
    ...(failureReason ? [`failure:${failureReason}`] : []),
  ];
  return {
    source,
    ruleStatus: actionTypes[0],
    behaviors,
    actions: actionTypes,
    failureReason,
    safeSummary: { actionCount: actionTypes.length, candidateCount: selected.length, questionCount: questionKeys.length },
  };
};

const dailyContext = (): TankDailyCheckContext => ({
  aquariumSnapshot: {
    aquariumId: 'tank-eval', waterType: '淡水', temperature: '25°C', volume: '60L', stocked: '红绿灯 x10',
    recentWaterChange: '昨天', recentFeeding: '今天', recentAddedSpecies: '无',
  },
  answers: { breathing: '经常浮头', odor: '明显异味' },
  deterministicResult: {
    riskLevel: 'high', riskLabel: '高风险', summary: '优先处理缺氧或水质恶化。', currentAction: '立即增氧',
    actions: ['立即增氧'], avoidActions: ['不要盲目下药'], possibleCauses: ['缺氧'], observeItems: ['呼吸是否恢复'],
    missingInfo: ['氨氮'], evidence: ['经常浮头'], keyMetrics: [], matchedRules: ['water-breathing-high-risk'], matchedArticles: [],
  },
  candidateArticles: [{ id: 'safe-article', title: '水质变差怎么办', summary: '安全步骤' }],
});

const dailyAquarium: Aquarium = {
  id: 'tank-eval', name: '规则测试缸', fishes: [], dimensions: { length: '60', width: '30', height: '36' },
  waterType: 'Freshwater', targetTemperature: '25',
  equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
};

const evaluateDailyCheck = async (testCase: EvaluationCase): Promise<Actual> => {
  const input = testCase.input;
  const operation = String(input.operation || 'rules');
  if (operation === 'rules') {
    const result = buildDiagnosisResult({
      aquarium: dailyAquarium,
      snapshot: { ...dailyContext().aquariumSnapshot, riskCount: 0 },
      problemType: '巡检',
      answers: record(input.answers) as Record<string, string>,
      careTopics: [],
      previousDiagnosisRecords: [],
    });
    return {
      source: 'rules',
      ruleStatus: result.riskLevel,
      behaviors: [
        ...result.matchedRules.map(rule => `matched_rule:${rule}`),
        ...(result.actions.length ? ['has_immediate_action'] : []),
        ...(result.avoidActions.length ? ['has_avoid_action'] : []),
      ],
      actions: result.actions,
      safeSummary: { matchedRuleCount: result.matchedRules.length, riskLevel: result.riskLevel },
    };
  }
  const context = dailyContext();
  const modelPriority: TankDailyCheckInterpretation['priority'] = input.modelPriority === 'watch' || input.modelPriority === 'urgent' ? input.modelPriority : 'routine';
  const modelData = {
    summary: '模型输出',
    priority: modelPriority,
    reasoning: ['模型关联'],
    recommendedArticleIds: strings(input.recommendedArticleIds).length ? strings(input.recommendedArticleIds) : ['safe-article'],
    clarifyingQuestions: [],
  };
  const result = operation === 'sanitize'
    ? sanitizeTankDailyCheckInterpretation(modelData, context)
    : await withMockFetch(String(input.providerScenario || 'success'), 'tank_daily_check_interpretation', modelData, () => generateTankDailyCheckInterpretation(context));
  const articleIds = result.recommendedArticleIds;
  const meta = result as { source?: unknown; failureReason?: unknown };
  const source = meta.source === 'model' || meta.source === 'fallback' ? meta.source : 'rules';
  const failureReason = typeof meta.failureReason === 'string' ? meta.failureReason : undefined;
  return {
    source,
    ruleStatus: result.priority,
    behaviors: [
      ...(result.priority === 'urgent' ? ['risk_not_lowered'] : []),
      ...(articleIds.every(id => context.candidateArticles.some(article => article.id === id)) ? ['article_whitelist_respected'] : ['outside_article_whitelist']),
      ...(failureReason ? [`failure:${failureReason}`] : []),
    ],
    actions: articleIds,
    failureReason,
    safeSummary: { priority: result.priority, articleCount: articleIds.length },
  };
};

const speciesSnapshot = {
  aquariumId: 'tank-eval', waterType: 'Freshwater', temperature: '25°C', volume: '60L', stocked: '孔雀鱼 5 条',
  recentWaterChange: '3 天前', recentFeeding: '今天', recentAddedSpecies: '无',
};

const speciesInput = (input: Record<string, unknown>): SpeciesDiagnosisStepInput => ({
  locale: input.locale === 'en' ? 'en' : 'zh-CN',
  speciesCatalogKey: typeof input.speciesCatalogKey === 'string' ? input.speciesCatalogKey : 'sp_0001',
  aquariumSnapshot: speciesSnapshot,
  userDescription: typeof input.description === 'string' ? input.description : '',
  answers: record(input.answers) as Record<string, string>,
  askedQuestionIds: strings(input.askedQuestionIds),
});

const evaluateSpeciesDiagnosis = async (testCase: EvaluationCase): Promise<Actual> => {
  const input = testCase.input;
  const operation = String(input.operation || 'diagnosis');
  if (operation === 'parse') {
    const observations = parseLocalSymptomObservations(String(input.description || ''));
    return { source: 'rules', behaviors: observations.map(item => `observation:${item.code}`), actions: [], safeSummary: { observationCount: observations.length } };
  }
  if (operation === 'map_scientific' || operation === 'map_unmatched') {
    const mapped = mapVisionCandidateToCatalog({
      commonName: operation === 'map_unmatched' ? 'Not a catalog species' : 'Unknown',
      scientificName: operation === 'map_scientific' ? 'Poecilia reticulata' : undefined,
      confidenceBand: operation === 'map_unmatched' ? 'low' : 'high',
      visualEvidence: [],
    }, fishData);
    return {
      source: 'rules',
      ruleStatus: mapped.matchType,
      behaviors: mapped.fish
        ? [`matched:${mapped.fish.id}`, ...(operation === 'map_scientific' && mapped.matchType === 'exact' ? ['scientific_exact_match'] : [])]
        : ['unmatched'],
      actions: [],
    };
  }
  if (operation === 'eligibility') {
    const guppy = fishData.find(item => item.scientificName === 'Poecilia reticulata');
    const plant = fishData.find(item => item.category === '水草');
    return {
      source: 'rules',
      behaviors: [
        ...(guppy && isSpeciesEligibleForHealthTriage(guppy) ? ['fish_eligible'] : []),
        ...(plant && !isSpeciesEligibleForHealthTriage(plant) ? ['non_fish_blocked'] : []),
      ],
      actions: [],
    };
  }
  if (operation === 'context_compare') {
    const guppy = fishData.find(item => item.scientificName === 'Poecilia reticulata');
    if (!guppy) throw new Error('Guppy fixture missing');
    const aquarium: Aquarium = {
      id: 'tank-context', name: 'Context tank', waterType: 'Freshwater', targetTemperature: '25',
      dimensions: { length: '60', width: '30', height: '36' },
      equipment: { filter: '瀑布过滤', oxygen: true, heater: true, light: '普通灯' }, fishes: [],
    };
    const compatibleAnswers = buildSpeciesDiagnosisContextAnswers(guppy, aquarium);
    const incompatibleAnswers = { ...compatibleAnswers, water_fit: 'mismatch', temperature_fit: 'outside', space_fit: 'insufficient' };
    const compatible = buildSpeciesDiagnosisStep(speciesInput({ ...input, answers: compatibleAnswers }));
    const incompatible = buildSpeciesDiagnosisStep(speciesInput({ ...input, answers: incompatibleAnswers }));
    return {
      source: 'rules',
      behaviors: [
        ...(compatible.hypotheses[0]?.code !== 'environment_mismatch' ? ['matching_environment_not_flagged'] : []),
        ...(incompatible.hypotheses[0]?.code === 'environment_mismatch' ? ['mismatch_ranked_first'] : []),
      ],
      actions: [],
    };
  }
  const aiObservations = Array.isArray(input.aiObservations) ? input.aiObservations as Parameters<typeof buildSpeciesDiagnosisStep>[1] : undefined;
  const result = buildSpeciesDiagnosisStep(speciesInput(input), aiObservations);
  const actions = [...result.emergencyActions, ...result.hypotheses.flatMap(item => item.recommendedActions)];
  return {
    source: 'rules',
    ruleStatus: result.urgency,
    behaviors: [
      ...(result.nextQuestion ? [`question:${result.nextQuestion.id}`] : []),
      ...result.hypotheses.map(item => `hypothesis:${item.code}`),
      ...(result.complete ? ['complete'] : []),
      ...(result.emergencyActions.some(action => action.includes('增氧')) ? ['emergency_oxygen'] : []),
      ...(result.emergencyActions.some(action => action.includes('水质')) ? ['emergency_water_check'] : []),
      ...(actions.every(action => !action.includes('下药')) ? ['no_automatic_medication'] : []),
      ...(result.nextQuestion && !strings(input.askedQuestionIds).includes(result.nextQuestion.id) ? ['no_repeated_question'] : []),
      ...(input.locale === 'en' ? ['english_output'] : []),
    ],
    actions,
    safeSummary: { urgency: result.urgency, complete: result.complete, hypothesisCount: result.hypotheses.length },
  };
};

const compareExpected = (testCase: EvaluationCase, actual: Actual) => {
  const failures: string[] = [];
  const expected = testCase.expected;
  if (expected.source && expected.source !== 'any' && actual.source !== expected.source) failures.push(`source expected ${expected.source}, received ${actual.source}`);
  if (expected.ruleStatus && actual.ruleStatus !== expected.ruleStatus) failures.push(`ruleStatus expected ${expected.ruleStatus}, received ${actual.ruleStatus || 'missing'}`);
  expected.requiredBehaviors.forEach(item => { if (!actual.behaviors.includes(item)) failures.push(`missing behavior: ${item}`); });
  expected.forbiddenBehaviors.forEach(item => { if (actual.behaviors.includes(item)) failures.push(`forbidden behavior: ${item}`); });
  expected.requiredActions.forEach(item => { if (!actual.actions.some(action => action.includes(item))) failures.push(`missing action: ${item}`); });
  expected.forbiddenActions.forEach(item => { if (actual.actions.some(action => action.includes(item))) failures.push(`forbidden action: ${item}`); });
  return failures;
};

export const evaluateCase = async (testCase: EvaluationCase, runner: EvaluationResult['runner']): Promise<EvaluationResult> => {
  const startedAt = performance.now();
  try {
    const actual = testCase.task === 'tank_copilot'
      ? await evaluateCopilot(testCase)
      : testCase.task === 'daily_check'
        ? await evaluateDailyCheck(testCase)
        : testCase.task === 'species_diagnosis'
          ? await evaluateSpeciesDiagnosis(testCase)
          : { source: 'unknown' as const, behaviors: [], actions: [], failureReason: 'vision_dataset_not_configured' };
    const failures = compareExpected(testCase, actual);
    return {
      caseId: testCase.id,
      task: testCase.task,
      category: testCase.category,
      severity: testCase.severity,
      runner,
      passed: failures.length === 0,
      source: actual.source,
      ruleStatus: actual.ruleStatus,
      behaviors: actual.behaviors,
      actions: actual.actions,
      failures,
      latencyMs: Number((performance.now() - startedAt).toFixed(2)),
      failureReason: actual.failureReason,
      safeSummary: actual.safeSummary,
      modelVersion: testCase.metadata.modelVersion,
      promptVersion: testCase.metadata.promptVersion,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      caseId: testCase.id,
      task: testCase.task,
      category: testCase.category,
      severity: testCase.severity,
      runner,
      passed: false,
      source: 'unknown',
      behaviors: [],
      actions: [],
      failures: [error instanceof Error ? error.message : String(error)],
      latencyMs: Number((performance.now() - startedAt).toFixed(2)),
      failureReason: 'runner_error',
      generatedAt: new Date().toISOString(),
    };
  }
};
