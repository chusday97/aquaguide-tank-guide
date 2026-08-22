import assert from 'node:assert/strict';
import fs from 'node:fs';
import { sanitizeTankCopilotResponse, type CopilotResponseCore } from '../src/modules/copilot/copilot.policy';
import type { TankCopilotContext } from '../src/modules/copilot/copilot.types';

const baseContext: TankCopilotContext = {
  goal: '新手低维护淡水缸，想要有群游感，不想频繁打理',
  answers: {},
  aquariumSummary: {
    id: 'tank-1',
    name: '测试缸',
    waterType: 'Freshwater',
    volumeLiters: 63,
    sizeCm: { length: '60', width: '30', height: '35' },
    targetTemperature: '25',
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '水草灯' },
    livestockCount: 0,
    livestock: [],
  },
  missingInformation: [],
  safeCandidates: [
    {
      speciesId: 'neon-tetra',
      name: '霓虹灯鱼',
      status: 'compatible',
      recommendedQuantity: 8,
      reason: '当前缸体与水温满足基础条件。',
      risks: [],
    },
    {
      speciesId: 'cherry-shrimp',
      name: '樱花虾',
      status: 'compatible',
      recommendedQuantity: 10,
      reason: '体型和维护需求适合当前鱼缸。',
      risks: [],
    },
  ],
  adjustableCandidates: [],
  blockedReasons: ['金鱼需要更大体积，不进入当前候选池。'],
  ruleVersion: 'tank-compatibility-v1',
};

const uselessModelResponse: CopilotResponseCore = {
  goalUnderstanding: '你想做一个新手低维护淡水缸。',
  missingQuestions: [],
  planSummary: '可以先看看候选，再决定下一步。',
  recommendedActions: [{ type: 'restart_goal', label: '重新描述目标' }],
  selectedCandidateIds: [],
  blockedExplanation: [],
};

const recovered = sanitizeTankCopilotResponse(uselessModelResponse, baseContext);
assert.ok(
  recovered.selectedCandidateIds.length > 0,
  'When deterministic rules already provide safe candidates, a syntactically valid but empty model selection must be recovered into actionable candidates.',
);
assert.equal(
  recovered.recommendedActions[0]?.type,
  'view_safe_candidates',
  'When safe candidates exist and no required tank info is missing, restart_goal must not remain the primary action for an otherwise usable goal.',
);
assert.ok(
  recovered.selectedCandidateIds.every(id => baseContext.safeCandidates.some(candidate => candidate.speciesId === id)),
  'Recovered candidates must remain inside the deterministic safe/adjustable pool.',
);

const missingInfoContext: TankCopilotContext = {
  ...baseContext,
  aquariumSummary: {
    ...baseContext.aquariumSummary,
    volumeLiters: 0,
    sizeCm: { length: null, width: null, height: null },
    targetTemperature: undefined,
  },
  missingInformation: ['鱼缸尺寸 / 容量', '目标水温'],
};

const distractedModelResponse: CopilotResponseCore = {
  goalUnderstanding: '你想做一个好看的鱼缸。',
  missingQuestions: [
    { id: 'preference', prompt: '你最喜欢什么颜色？', informationKey: 'preference' },
  ],
  planSummary: '先告诉我更多偏好。',
  recommendedActions: [{ type: 'restart_goal', label: '重新描述目标' }],
  selectedCandidateIds: [],
  blockedExplanation: [],
};

const missingInfoRecovered = sanitizeTankCopilotResponse(distractedModelResponse, missingInfoContext);
assert.equal(
  missingInfoRecovered.recommendedActions[0]?.type,
  'complete_tank_info',
  'Missing deterministic tank facts must outrank preference chatter in the primary action.',
);
assert.ok(
  missingInfoRecovered.missingQuestions.some(question => question.informationKey === 'tank_size'),
  'The usability guard must restore a missing tank-size question when tank size is required.',
);
assert.ok(
  missingInfoRecovered.missingQuestions.some(question => question.informationKey === 'temperature'),
  'The usability guard must restore a missing temperature question when target temperature is required.',
);

const serverSource = fs.readFileSync('server/index.mjs', 'utf8');
assert.match(
  serverSource,
  /selectedCandidateIds[^\n]+至少|至少[^\n]+selectedCandidateIds|safeCandidates[^\n]+selectedCandidateIds/,
  'Tank Copilot prompt must explicitly require actionable candidate selection when deterministic safe candidates exist.',
);
assert.match(
  serverSource,
  /planSummary[^\n]+候选|候选[^\n]+planSummary|recommendedQuantity/,
  'Tank Copilot prompt must require a concrete plan tied to candidate names/quantities rather than generic workflow prose.',
);

console.log('Tank Copilot usability contract passed: useful candidate recovery, missing-fact prioritization, deterministic pool boundary, and concrete prompt contract.');
