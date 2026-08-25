import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium } from '../src/types';
import type { DiagnosisRecord } from '../src/modules/diagnosis/diagnosis.types';
import {
  buildTankObservationsFromDiagnosisRecords,
  deriveCurrentTankState,
  getCurrentCombinationAgeDays,
} from '../src/services/aquarium/tank-state-evidence.service';

const NOW = new Date('2026-08-23T12:00:00.000Z');
const record = (overrides: Partial<DiagnosisRecord> = {}): DiagnosisRecord => ({
  diagnosisId: overrides.diagnosisId || `diag-${Math.random()}`,
  createdAt: overrides.createdAt || '2026-08-22T12:00:00.000Z',
  aquariumId: overrides.aquariumId || 'tank-1',
  problemType: overrides.problemType || '巡检',
  answers: overrides.answers || {},
  resultSummary: overrides.resultSummary || '检查记录',
  riskLevel: overrides.riskLevel || '低风险',
  riskCode: overrides.riskCode || 'low',
  suggestedActions: overrides.suggestedActions || [],
  missingInfo: overrides.missingInfo || [],
  followUpNotes: overrides.followUpNotes || [],
  ...overrides,
});
const species = (id: string) => {
  const found = fishData.find(item => item.id === id);
  if (!found) throw new Error(`missing species ${id}`);
  return found;
};
const miniParrot = species('sp_0021');
const tigerBarb = species('sp_0439');

const baseTank = (overrides: Partial<Aquarium> = {}): Aquarium => ({
  id: 'tank-1',
  name: 'P0 测试缸',
  waterType: 'Freshwater',
  targetTemperature: '25',
  dimensions: { length: '100', width: '45', height: '45' },
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
  fishes: [],
  startedAt: '2026-01-01T12:00:00.000Z',
  ...overrides,
});

{
  const observations = buildTankObservationsFromDiagnosisRecords([
    record({ answers: { breathing: '正常', behavior: '正常游动和进食', waterLook: '清澈', odor: '没有异味' } }),
  ], 'tank-1');
  assert.ok(observations.some(item => item.code === 'normal_activity'));
  assert.ok(observations.some(item => item.code === 'normal_feeding'));
  assert.ok(observations.every(item => !['persistent_chasing', 'injury', 'respiratory_distress'].includes(item.code)));
  console.log('PASS daily patrol normal answers become explicit normal observations');
}

{
  const observations = buildTankObservationsFromDiagnosisRecords([
    record({
      answers: { breathing: '正常', behavior: '正常游动和进食' },
      resultSummary: 'AI 文本里即使出现追咬、受伤等词，也不能覆盖结构化正常答案。',
    }),
  ], 'tank-1');
  assert.ok(observations.some(item => item.code === 'normal_activity'));
  assert.ok(observations.every(item => !['persistent_chasing', 'injury'].includes(item.code)));
  console.log('PASS free-text/result summary cannot silently create Tank State observation codes');
}

{
  const observations = buildTankObservationsFromDiagnosisRecords([
    record({ problemType: '追咬打架', answers: { aggression: '咬伤鳍条' } }),
    record({ diagnosisId: 'chase-1', createdAt: '2026-08-20T12:00:00.000Z', problemType: '追咬打架', answers: { aggression: '明显追咬' } }),
  ], 'tank-1');
  assert.ok(observations.some(item => item.code === 'injury'));
  assert.ok(observations.some(item => item.code === 'persistent_chasing'));
  console.log('PASS aggression records become injury/chasing observations');
}

{
  const observations = buildTankObservationsFromDiagnosisRecords([
    record({ problemType: '鱼浮头 / 呼吸急促', answers: { gasping: '呼吸明显急促' } }),
    record({ diagnosisId: 'death-1', problemType: '死亡 / 异常死亡', answers: { deathCount: '死亡多条' } }),
  ], 'tank-1');
  assert.ok(observations.some(item => item.code === 'respiratory_distress'));
  assert.ok(observations.some(item => item.code === 'multiple_deaths'));
  console.log('PASS physiological/death answers become urgent observations');
}

{
  const observations = buildTankObservationsFromDiagnosisRecords([
    record({
      problemType: '水质异常',
      answers: { mainProblem: '鱼浮头喘气', fishBehavior: '多条鱼异常' },
    }),
  ], 'tank-1');
  assert.ok(observations.some(item => item.code === 'respiratory_distress'));
  console.log('PASS current water-quality question fields surface respiratory urgency');
}

{
  const observations = buildTankObservationsFromDiagnosisRecords([
    record({
      answers: { breathing: '正常', behavior: '正常游动和进食', userDescription: '没有浮头，也没有追咬。' },
    }),
  ], 'tank-1');
  assert.ok(observations.some(item => item.code === 'normal_activity'));
  assert.ok(observations.every(item => !['respiratory_distress', 'persistent_chasing'].includes(item.code)));
  console.log('PASS free-text negation cannot upgrade a structured normal observation');
}

{
  const tank = baseTank({
    fishes: [
      { id: 'mini', fishId: miniParrot.id, quantity: 1, entryDate: '2026-07-01T12:00:00.000Z' },
      { id: 'tiger', fishId: tigerBarb.id, quantity: 6, entryDate: '2026-07-10T12:00:00.000Z' },
    ],
  });
  const state = deriveCurrentTankState({
    aquarium: tank,
    speciesCatalog: fishData,
    diagnosisRecords: [record({ answers: { breathing: '正常', behavior: '正常游动和进食' } })],
    now: NOW,
  });
  assert.ok(state.priors.length > 0, 'reviewed planning conflict must remain as prior context');
  assert.equal(state.hardConstraints.length, 0, 'behavior/territory conflict is not a water-type hard constraint');
  assert.equal(state.result.state, 'stable');
  assert.equal(state.result.primaryAction, 'no_action');
  console.log('PASS reviewed planning conflict + normal reality can produce stable current state');
}

{
  const tank = baseTank({
    dimensions: { length: '40', width: '25', height: '30' },
    fishes: [{ id: 'mini', fishId: miniParrot.id, quantity: 2, entryDate: '2026-06-01T12:00:00.000Z' }],
  });
  const state = deriveCurrentTankState({
    aquarium: tank,
    speciesCatalog: fishData,
    diagnosisRecords: [record({ answers: { breathing: '正常', behavior: '正常游动和进食' } })],
    now: NOW,
  });
  assert.ok(state.priors.some(item => item.kind === 'space'), 'generic tank-size gap should survive as a prior');
  assert.equal(state.result.state, 'stable');
  assert.equal(state.result.primaryAction, 'no_action');
  console.log('PASS 40cm mini-parrot example keeps space guidance as prior, not current intervention');
}

{
  const freshwater = { ...miniParrot, id: 'fresh-test', name: '淡水测试鱼', category: '淡水观赏鱼' };
  const marine = { ...tigerBarb, id: 'marine-test', name: '海水测试鱼', category: '海水观赏鱼', description: '海水鱼' };
  const tank = baseTank({
    fishes: [
      { id: 'fresh', fishId: freshwater.id, quantity: 1, entryDate: '2026-08-01T12:00:00.000Z' },
      { id: 'marine', fishId: marine.id, quantity: 1, entryDate: '2026-08-01T12:00:00.000Z' },
    ],
  });
  const state = deriveCurrentTankState({
    aquarium: tank,
    speciesCatalog: [freshwater, marine],
    diagnosisRecords: [record({ answers: { breathing: '正常', behavior: '正常游动和进食' } })],
    now: NOW,
  });
  assert.ok(state.hardConstraints.some(item => item.code === 'species_water_type_conflict' || item.code === 'water_type_mismatch'));
  assert.equal(state.result.state, 'urgent');
  console.log('PASS true freshwater/marine conflict remains urgent despite normal behavior observation');
}

{
  const tank = baseTank({
    fishes: [
      { id: 'older', fishId: miniParrot.id, quantity: 1, entryDate: '2026-01-01T12:00:00.000Z' },
      { id: 'newer', fishId: tigerBarb.id, quantity: 1, entryDate: '2026-08-20T12:00:00.000Z' },
    ],
  });
  assert.equal(getCurrentCombinationAgeDays(tank, NOW), 3, 'combination age starts at the latest current-stock entry, not the first fish');
  console.log('PASS combination age uses latest current-stock entry');
}

console.log('P0 Tank Evidence Adapter V1: PASS');
