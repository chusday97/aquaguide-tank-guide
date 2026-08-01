import { performance } from 'node:perf_hooks';
import type { EvaluationResult } from '../schemas/evaluation-case.schema';
import { readEvaluationCases, writeResults } from './io';

if (process.env.RUN_LIVE_EVAL !== '1') {
  console.log('Live evaluation skipped. Set RUN_LIVE_EVAL=1 to call the configured AquaGuide BFF.');
  process.exit(0);
}

const apiBaseUrl = (process.env.EVAL_API_BASE_URL || 'http://127.0.0.1:8787').replace(/\/$/, '');
const cases = readEvaluationCases([
  'evaluation/datasets/tank-copilot.v1.jsonl',
  'evaluation/datasets/daily-check.v1.jsonl',
]).filter(testCase => testCase.input.liveEligible === true);

const safeContext = (task: string) => task === 'tank_copilot'
  ? {
      goal: '新手淡水缸', answers: {},
      aquariumSummary: { id: 'eval-tank', waterType: 'Freshwater', volumeLiters: 30, sizeCm: { length: '40', width: '25', height: '30' }, targetTemperature: '25', equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' }, livestockCount: 0, livestock: [] },
      missingInformation: [], safeCandidates: [{ speciesId: 'sp_0001', name: '孔雀鱼', status: 'compatible', recommendedQuantity: 3, reason: '规则候选' }], adjustableCandidates: [], blockedReasons: [], ruleVersion: 'tank-compatibility-v1',
    }
  : {
      aquariumSnapshot: { aquariumId: 'eval-tank', waterType: '淡水', temperature: '25°C', volume: '60L', stocked: '示例生物', recentWaterChange: '昨天', recentFeeding: '今天', recentAddedSpecies: '无' },
      answers: { breathing: '经常浮头' },
      deterministicResult: { riskLevel: 'high', riskLabel: '高风险', summary: '优先处理缺氧。', currentAction: '立即增氧', actions: ['立即增氧'], avoidActions: ['不要盲目下药'], possibleCauses: ['缺氧'], observeItems: ['呼吸是否恢复'], missingInfo: [], evidence: ['经常浮头'], keyMetrics: [], matchedRules: ['frequent-breathing-warning'], matchedArticles: [] },
      candidateArticles: [{ id: 'safe-article', title: '缺氧处理', summary: '安全步骤' }],
    };

const results: EvaluationResult[] = [];
for (const testCase of cases) {
  const task = testCase.task === 'tank_copilot' ? 'build_tank_copilot' : 'tank_daily_check_interpretation';
  const startedAt = performance.now();
  try {
    const response = await fetch(`${apiBaseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, context: safeContext(testCase.task) }),
    });
    const payload = await response.json().catch(() => ({})) as { task?: unknown; data?: unknown; error?: unknown };
    const valid = response.ok && payload.task === task && payload.data && typeof payload.data === 'object';
    results.push({
      caseId: testCase.id,
      task: testCase.task,
      category: testCase.category,
      severity: testCase.severity,
      runner: 'live_provider',
      passed: Boolean(valid),
      source: valid ? 'model' : 'unknown',
      behaviors: valid ? ['structured_response'] : [],
      actions: [],
      failures: valid ? [] : [`BFF returned ${response.status} or invalid task/structure`],
      latencyMs: Number((performance.now() - startedAt).toFixed(2)),
      failureReason: valid ? undefined : response.status === 503 ? 'not_configured' : 'live_provider_failure',
      safeSummary: { httpStatus: response.status, taskMatched: payload.task === task, dataKeys: payload.data && typeof payload.data === 'object' ? Object.keys(payload.data as object).slice(0, 12) : [] },
      modelVersion: process.env.EVAL_MODEL_VERSION || testCase.metadata.modelVersion,
      promptVersion: process.env.EVAL_PROMPT_VERSION || testCase.metadata.promptVersion,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    results.push({
      caseId: testCase.id, task: testCase.task, category: testCase.category, severity: testCase.severity,
      runner: 'live_provider', passed: false, source: 'unknown', behaviors: [], actions: [],
      failures: [error instanceof Error ? error.name : 'live request failed'],
      latencyMs: Number((performance.now() - startedAt).toFixed(2)), failureReason: 'network',
      safeSummary: { errorType: error instanceof Error ? error.name : 'unknown' },
      modelVersion: process.env.EVAL_MODEL_VERSION, promptVersion: process.env.EVAL_PROMPT_VERSION,
      generatedAt: new Date().toISOString(),
    });
  }
}

const path = writeResults('live-provider', results);
console.log(`live provider evaluation: ${results.filter(result => result.passed).length}/${results.length} passed`);
console.log(`report input: ${path}`);
if (results.some(result => !result.passed)) process.exitCode = 1;
