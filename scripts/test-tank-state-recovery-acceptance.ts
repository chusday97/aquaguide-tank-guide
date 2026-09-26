import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium } from '../src/types';
import type { DiagnosisRecord } from '../src/modules/diagnosis/diagnosis.types';
import { evaluateTankState } from '../packages/domain-rules/src/tank-state';
import { deriveCurrentTankState } from '../src/services/aquarium/tank-state-evidence.service';
import { buildCurrentTankRiskItems } from '../src/services/aquarium/tank-state-presentation.service';

const NOW = new Date('2026-09-26T08:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;
const at = (daysAgo: number) => new Date(NOW.getTime() - daysAgo * DAY).toISOString();

const record = (daysAgo: number, problemType: string, answers: Record<string, string>, idSuffix = problemType): DiagnosisRecord => ({
  diagnosisId: `diag-${daysAgo}-${idSuffix}`,
  createdAt: at(daysAgo),
  aquariumId: 'tank-recovery',
  problemType,
  answers,
  resultSummary: '结构化复查记录',
  riskLevel: '低风险',
  riskCode: 'low',
  suggestedActions: [],
  missingInfo: [],
  followUpNotes: [],
});

const aquarium = (items: Array<[string, number]>, overrides: Partial<Aquarium> = {}): Aquarium => ({
  id: 'tank-recovery',
  name: '恢复链验收缸',
  waterType: 'Freshwater',
  targetTemperature: '25',
  dimensions: { length: '150', width: '50', height: '50' },
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
  fishes: items.map(([fishId, quantity], index) => ({
    id: `stock-${index}`,
    fishId,
    quantity,
    entryDate: '2026-09-01T08:00:00.000Z',
  })),
  startedAt: '2026-08-01T08:00:00.000Z',
  ...overrides,
});

const derive = (tank: Aquarium, diagnosisRecords: DiagnosisRecord[]) => {
  const evidence = deriveCurrentTankState({ aquarium: tank, speciesCatalog: fishData, diagnosisRecords, now: NOW });
  const items = buildCurrentTankRiskItems({ aquarium: tank, speciesCatalog: fishData, evidence });
  return { evidence, items };
};

const community = aquarium([['sp_0012', 8], ['sp_0431', 10], ['sp_0443', 6]]);
const tigerGuppy = aquarium([['sp_0439', 8], ['sp_0436', 8]]);

{
  const { evidence } = derive(community, [
    record(3, '鱼浮头 / 呼吸急促', { gasping: '呼吸明显急促' }, 'resp'),
    record(1, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-1'),
  ]);
  assert.equal(evidence.result.state, 'urgent');
}

{
  const { evidence, items } = derive(community, [
    record(3, '鱼浮头 / 呼吸急促', { gasping: '呼吸明显急促' }, 'resp'),
    record(2, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-1'),
    record(1, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-2'),
  ]);
  assert.equal(evidence.result.state, 'watch');
  assert.ok(evidence.result.matchedRules.includes('AQ-STATE-010'));
  assert.match(items[0]?.title || '', /异常已有缓解/);
}

{
  const { evidence, items } = derive(community, [
    record(4, '鱼浮头 / 呼吸急促', { gasping: '呼吸明显急促' }, 'resp'),
    record(3, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-1'),
    record(2, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-2'),
    record(1, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-3'),
  ]);
  assert.equal(evidence.result.state, 'stable');
  assert.equal(evidence.result.primaryAction, 'no_action');
  assert.equal(evidence.result.matchedRules.includes('AQ-STATE-010'), false);
  assert.deepEqual(items, []);
}

{
  const { evidence } = derive(tigerGuppy, [
    record(4, '追咬打架', { aggression: '明显追咬' }, 'chase'),
    record(3, '躲藏不动', { hiding: '长时间躲藏', chasing: '明显追咬' }, 'hide'),
    record(1, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-1'),
  ]);
  assert.equal(evidence.result.state, 'intervene');
}

{
  const { evidence, items } = derive(tigerGuppy, [
    record(5, '追咬打架', { aggression: '明显追咬' }, 'chase'),
    record(4, '躲藏不动', { hiding: '长时间躲藏', chasing: '明显追咬' }, 'hide'),
    record(2, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-1'),
    record(1, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-2'),
  ]);
  assert.equal(evidence.result.state, 'watch');
  assert.ok(evidence.result.matchedRules.includes('AQ-STATE-010'));
  assert.match(items[0]?.nextStep || '', /1–2 次结构化复查/);
}

{
  const { evidence } = derive(tigerGuppy, [
    record(6, '追咬打架', { aggression: '明显追咬' }, 'chase'),
    record(5, '躲藏不动', { hiding: '长时间躲藏', chasing: '明显追咬' }, 'hide'),
    record(3, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-1'),
    record(2, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-2'),
    record(1, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-3'),
  ]);
  assert.equal(evidence.result.state, 'watch');
  assert.ok(evidence.result.matchedRules.includes('AQ-STATE-009'));
  assert.equal(evidence.result.matchedRules.includes('AQ-STATE-010'), false);
}

{
  const result = evaluateTankState({
    now: NOW.toISOString(),
    priors: [{
      code: 'medium-territory-prior',
      kind: 'territory',
      level: 'medium',
      evidence: '存在中等领地压力背景。',
      observationTargets: ['持续追逐', '长期躲藏'],
    }],
    observations: [
      { code: 'persistent_chasing', observedAt: at(6), evidence: '追咬' },
      { code: 'hiding_pressure', observedAt: at(5), evidence: '躲藏' },
      { code: 'no_persistent_chasing', observedAt: at(3), evidence: '无追咬' },
      { code: 'no_hiding_pressure', observedAt: at(3), evidence: '无躲藏压力' },
      { code: 'no_persistent_chasing', observedAt: at(2), evidence: '无追咬' },
      { code: 'no_hiding_pressure', observedAt: at(2), evidence: '无躲藏压力' },
      { code: 'no_persistent_chasing', observedAt: at(1), evidence: '无追咬' },
      { code: 'no_hiding_pressure', observedAt: at(1), evidence: '无躲藏压力' },
      { code: 'normal_activity', observedAt: at(1), evidence: '活动正常' },
    ],
  });
  assert.equal(result.state, 'stable');
}

{
  const { evidence } = derive(tigerGuppy, [
    record(7, '追咬打架', { aggression: '明显追咬' }, 'old-chase'),
    record(6, '躲藏不动', { hiding: '长时间躲藏', chasing: '明显追咬' }, 'old-hide'),
    record(5, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-1'),
    record(4, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-2'),
    record(3, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-3'),
    record(1, '追咬打架', { aggression: '明显追咬' }, 'relapse-chase'),
    record(1, '躲藏不动', { hiding: '长时间躲藏', chasing: '明显追咬' }, 'relapse-hide'),
  ]);
  assert.equal(evidence.result.state, 'intervene');
  assert.ok(evidence.result.activeSignals.includes('persistent_chasing'));
}

{
  const result = evaluateTankState({
    now: NOW.toISOString(),
    observations: [
      { code: 'persistent_chasing', observedAt: at(10), evidence: '10 天前追咬' },
      { code: 'persistent_chasing', observedAt: at(9), evidence: '9 天前追咬' },
    ],
  });
  assert.equal(result.state, 'watch');
  assert.equal(result.confidence, 'low');
  assert.ok(result.matchedRules.includes('AQ-STATE-011'));
  assert.deepEqual(result.activeSignals, []);
}

{
  const coldWarm = aquarium([['sp_0434', 8], ['sp_0447', 5]], { targetTemperature: '25' });
  const { evidence } = derive(coldWarm, [
    record(3, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-1'),
    record(2, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-2'),
    record(1, '巡检', { breathing: '正常', behavior: '正常游动和进食' }, 'normal-3'),
  ]);
  assert.ok(evidence.hardConstraints.some(item => item.code.includes('temperature')));
  assert.equal(evidence.result.state, 'intervene');
  assert.ok(evidence.result.matchedRules.includes('AQ-STATE-004'));
}

console.log('tank-state recovery acceptance passed: 10 escalation -> recovery -> relapse scenarios');
