import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dataset from '../evaluation/product/core-flow-state-eval-v2.json' with { type: 'json' };
import type { DiagnosisRecord } from '../src/modules/diagnosis/diagnosis.types';
import { upsertDiagnosisRecord } from '../src/services/diagnosis/diagnosis-records.service';
import { isFutureWaterChangeDate, setWaterChangeDateRecorded } from '../src/services/aquarium/water-change.service';

assert.equal(dataset.version, 'v2');
assert.ok(dataset.cases.length >= 6, 'v2 needs at least 6 evaluation cases');
assert.ok(dataset.cases.some(item => item.flow === 'water_change'), 'v2 must cover water-change flow');
assert.ok(dataset.cases.some(item => item.flow === 'daily_check'), 'v2 must cover daily-check flow');
assert.ok(dataset.cases.some(item => item.state === 'failure'), 'v2 must cover persistence failure');
assert.ok(dataset.cases.some(item => item.state === 'retry'), 'v2 must cover retry behavior');
assert.ok(dataset.cases.some(item => item.state === 'edge_case'), 'v2 must cover edge cases');

assert.equal(isFutureWaterChangeDate('2099-01-01', new Date('2026-08-12T08:00:00.000Z')), true);
assert.equal(isFutureWaterChangeDate('2026-08-12', new Date('2026-08-12T08:00:00.000Z')), false);
assert.equal(isFutureWaterChangeDate('2026-08-11', new Date('2026-08-12T08:00:00.000Z')), false);

const history = ['2026-08-10'];
const added = setWaterChangeDateRecorded(history, '2026-08-11', true);
assert.deepEqual(added, ['2026-08-10', '2026-08-11']);
assert.deepEqual(setWaterChangeDateRecorded(added, '2026-08-11', true), added, 'retry must be idempotent');
assert.deepEqual(setWaterChangeDateRecorded(added, '2026-08-11', false), ['2026-08-10']);

const makeDiagnosisRecord = (id: string, createdAt: string, resultSummary: string): DiagnosisRecord => ({
  id,
  diagnosisId: id,
  createdAt,
  aquariumId: 'tank-a',
  problemType: '巡检',
  answers: {},
  structuredAnswers: [],
  resultSummary,
  riskLevel: 'low',
  riskCode: 'low',
  conclusion: resultSummary,
  keyMetrics: [],
  suggestedActions: [],
  avoidActions: [],
  observeItems: [],
  missingInfo: [],
  optionalMissingInfo: [],
  followUpNotes: [],
});

const firstRecord = makeDiagnosisRecord('daily-a', '2026-08-12T08:00:00.000Z', 'first');
const replacementRecord = makeDiagnosisRecord('daily-b', '2026-08-12T12:00:00.000Z', 'replacement');
const nextDayRecord = makeDiagnosisRecord('daily-c', '2026-08-13T01:00:00.000Z', 'next day');
const sameDay = upsertDiagnosisRecord([], firstRecord);
const replaced = upsertDiagnosisRecord(sameDay, replacementRecord);
assert.equal(replaced.length, 1);
assert.equal(replaced[0]?.id, 'daily-a', 'same-day patrol update must preserve the original record identity');
assert.equal(replaced[0]?.resultSummary, 'replacement');
const nextDay = upsertDiagnosisRecord(replaced, nextDayRecord);
assert.equal(nextDay.length, 2);

const aquariumSource = readFileSync(resolve(import.meta.dirname, '../src/pages/Aquarium.tsx'), 'utf8');
assert.match(aquariumSource, /isWaterChangeSaving/, 'water-change save needs an explicit in-progress state');
assert.match(aquariumSource, /waterChangeError/, 'water-change save needs an explicit failure state');
assert.match(aquariumSource, /disabled=\{isFuture[^}]*\}/, 'future calendar dates must be disabled');
assert.match(aquariumSource, /isFutureWaterChangeDate\(selectedWaterChangeDate\)/, 'footer save must reject future dates at the business boundary');
assert.match(aquariumSource, /isDiagnosisRecordSaving/, 'daily-check save needs an explicit in-progress state');
assert.match(aquariumSource, /diagnosisSaveError/, 'daily-check save needs an explicit failure state');
assert.match(aquariumSource, /const saved = await handleSaveDiagnosisRecord\(\);\s*if \(!saved\) return;/s, 'post-save primary action must await persistence and stop when the daily check was not persisted');

console.log(`核心流程状态验收 v2 通过：${dataset.cases.length} 个 Case，覆盖换水记录与每日检查的至少 6 种状态。`);
