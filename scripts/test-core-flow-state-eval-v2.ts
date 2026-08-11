import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Aquarium } from '../src/types';
import {
  applyWaterChangeHistory,
  getLatestWaterChangeDate,
  isFutureWaterChangeDate,
  toggleWaterChangeDate,
} from '../src/services/aquarium/water-change.service';
import { upsertDiagnosisRecord } from '../src/services/diagnosis/diagnosis-records.service';
import type { DiagnosisRecord } from '../src/modules/diagnosis/diagnosis.types';

const dataset = JSON.parse(readFileSync(resolve(import.meta.dirname, '../evaluation/product/core-flow-v2.json'), 'utf8')) as {
  version: number;
  cases: Array<{ id: string; featureId: string; state: string }>;
};

assert.equal(dataset.version, 1);
assert.ok(dataset.cases.length >= 12, 'v2 core flow evaluation must contain at least 12 cases');
for (const featureId of ['water_change', 'daily_check']) {
  const states = new Set(dataset.cases.filter(item => item.featureId === featureId).map(item => item.state));
  assert.ok(states.size >= 6, `${featureId} must cover at least 6 states`);
}

const expectedCaseIds = [
  'CF-WATER-001', 'CF-WATER-002', 'CF-WATER-003', 'CF-WATER-004', 'CF-WATER-005', 'CF-WATER-006',
  'CF-DAILY-001', 'CF-DAILY-002', 'CF-DAILY-003', 'CF-DAILY-004', 'CF-DAILY-005', 'CF-DAILY-006',
];
for (const id of expectedCaseIds) {
  assert.ok(dataset.cases.some(item => item.id === id), `missing evaluation case ${id}`);
}

// CF-WATER-006: future dates are not eligible as completed water changes.
const now = new Date(2026, 7, 12, 12, 0, 0, 0);
assert.equal(isFutureWaterChangeDate('2026-08-13', now), true);
assert.equal(isFutureWaterChangeDate('2026-08-12', now), false);
assert.equal(isFutureWaterChangeDate('2026-08-01', now), false);
assert.equal(isFutureWaterChangeDate('not-a-date', now), true);

// CF-WATER-003/004: history is sorted and the latest real record drives aquarium + fish state.
let history = toggleWaterChangeDate([], '2026-08-10');
history = toggleWaterChangeDate(history, '2026-08-01');
assert.deepEqual(history, ['2026-08-01', '2026-08-10']);
assert.equal(getLatestWaterChangeDate(history), '2026-08-10');

const tank: Aquarium = {
  id: 'water-v2-tank',
  name: '换水验收缸',
  fishes: [
    { fishId: 'fish-a', quantity: 2 },
    { fishId: 'fish-b', quantity: 1 },
  ],
};
const withHistory = applyWaterChangeHistory(tank, history);
assert.deepEqual(withHistory.waterChangeHistory, ['2026-08-01', '2026-08-10']);
assert.equal(withHistory.lastWaterChangeDate?.slice(0, 10), '2026-08-10');
assert.ok(withHistory.fishes.every(item => item.lastWaterChangeDate?.slice(0, 10) === '2026-08-10'));

const emptyHistory = toggleWaterChangeDate(['2026-08-10'], '2026-08-10');
const withoutHistory = applyWaterChangeHistory(withHistory, emptyHistory);
assert.deepEqual(withoutHistory.waterChangeHistory, []);
assert.equal(withoutHistory.lastWaterChangeDate, undefined);
assert.ok(withoutHistory.fishes.every(item => item.lastWaterChangeDate === undefined));

// CF-DAILY-003: one aquarium gets one current record per day (upsert, not duplicate append).
const makeDiagnosisRecord = (id: string, createdAt: string, summary: string): DiagnosisRecord => ({
  id,
  aquariumId: 'daily-v2-tank',
  problemType: 'daily_check',
  answers: [],
  result: {
    riskLevel: 'normal',
    title: '日常检查',
    summary,
    immediateActions: [],
    possibleCauses: [],
    evidence: [],
    missingInfo: [],
    avoidActions: [],
    recheck: [],
    matchedSignals: [],
  },
  createdAt,
});
const firstRecord = makeDiagnosisRecord('daily-a', '2026-08-12T01:00:00.000Z', 'first');
const replacementRecord = makeDiagnosisRecord('daily-b', '2026-08-12T12:00:00.000Z', 'replacement');
const nextDayRecord = makeDiagnosisRecord('daily-c', '2026-08-13T01:00:00.000Z', 'next day');
const sameDay = upsertDiagnosisRecord([], firstRecord);
const replaced = upsertDiagnosisRecord(sameDay, replacementRecord);
assert.equal(replaced.length, 1);
assert.equal(replaced[0]?.id, 'daily-b');
assert.equal(replaced[0]?.result.summary, 'replacement');
const nextDay = upsertDiagnosisRecord(replaced, nextDayRecord);
assert.equal(nextDay.length, 2);

// UI contracts become regression checks once Aquarium.tsx is fixed.
const aquariumSource = readFileSync(resolve(import.meta.dirname, '../src/pages/Aquarium.tsx'), 'utf8');
assert.match(aquariumSource, /isWaterChangeSaving/, 'water-change save needs an explicit in-progress state');
assert.match(aquariumSource, /waterChangeError/, 'water-change save needs an explicit failure state');
assert.match(aquariumSource, /disabled=\{isFuture[^}]*\}/, 'future calendar dates must be disabled');
assert.match(aquariumSource, /isFutureWaterChangeDate\(selectedWaterChangeDate\)/, 'footer save must reject future dates at the business boundary');
assert.match(aquariumSource, /isDiagnosisRecordSaving/, 'daily-check save needs an explicit in-progress state');
assert.match(aquariumSource, /diagnosisSaveError/, 'daily-check save needs an explicit failure state');
assert.match(aquariumSource, /const saved = handleSaveDiagnosisRecord\(\);\s*if \(!saved\) return;/s, 'post-save primary action must stop when the daily check was not persisted');

console.log(`核心流程状态验收 v2 通过：${dataset.cases.length} 个 Case，覆盖换水记录与每日检查的至少 6 种状态。`);
