import assert from 'node:assert/strict';
import type { KeepingHistorySnapshot } from '../src/modules/collection/collection.types';
import type { DiagnosisRecord } from '../src/modules/diagnosis/diagnosis.types';
import { buildCollectionHomeModel } from '../src/services/collection/collection-home.service';
import type { Aquarium } from '../src/types';

const now = new Date('2026-10-23T12:00:00.000Z');

const emptyHistory: KeepingHistorySnapshot = {
  events: [],
  activeCohorts: [],
  speciesEverKeptIds: [],
  currentSpeciesIds: [],
  aquariumIds: [],
};

const makeTank = (overrides: Partial<Aquarium> = {}): Aquarium => ({
  id: 'tank-current',
  name: '主缸',
  startedAt: '2026-10-20T12:00:00.000Z',
  dimensions: { length: '60', width: '30', height: '30' },
  fishes: [
    { id: 'stock-a', fishId: 'fish-a', quantity: 3, entryDate: '2026-10-20T12:00:00.000Z' },
    { id: 'stock-b', fishId: 'fish-b', quantity: 2, entryDate: '2026-10-20T12:00:00.000Z' },
    { id: 'stock-a-2', fishId: 'fish-a', quantity: 1, entryDate: '2026-10-21T12:00:00.000Z' },
  ],
  ...overrides,
} as Aquarium);

const makePatrol = (
  riskCode: DiagnosisRecord['riskCode'],
  summary = '巡检记录',
  aquariumId = 'tank-current',
): DiagnosisRecord => ({
  diagnosisId: 'diagnosis-1',
  aquariumId,
  problemType: '巡检',
  createdAt: '2026-10-23T08:00:00.000Z',
  resultSummary: summary,
  conclusion: summary,
  riskCode,
  suggestedActions: ['继续观察'],
} as unknown as DiagnosisRecord);

const noTank = buildCollectionHomeModel({
  aquariums: [],
  diagnosisRecords: [],
  history: emptyHistory,
  now,
});
assert.equal(noTank.priority.kind, 'setup_aquarium');
assert.equal(noTank.aquarium, null);

const emptyTank = buildCollectionHomeModel({
  aquariums: [makeTank({ fishes: [] })],
  currentAquariumId: 'tank-current',
  diagnosisRecords: [],
  history: emptyHistory,
  now,
});
assert.equal(emptyTank.priority.kind, 'add_resident');

const due = buildCollectionHomeModel({
  aquariums: [makeTank()],
  currentAquariumId: 'tank-current',
  diagnosisRecords: [],
  history: emptyHistory,
  now,
});
assert.equal(due.priority.kind, 'daily_check_due', 'missing patrol must never be presented as stable');
assert.equal(due.speciesCount, 2, 'species count must be unique by fishId');
assert.equal(due.residentCount, 6, 'resident count must sum live quantities');
assert.equal(due.volumeLiters, 54);
assert.equal(due.daysRunning, 3);

const recorded = buildCollectionHomeModel({
  aquariums: [makeTank()],
  currentAquariumId: 'tank-current',
  diagnosisRecords: [makePatrol('low', '今日未见明显异常')],
  history: emptyHistory,
  now,
});
assert.equal(recorded.priority.kind, 'daily_check_recorded');
assert.equal(recorded.priority.summary, '今日未见明显异常');

for (const riskCode of ['medium', 'high', 'unknown'] as const) {
  const attention = buildCollectionHomeModel({
    aquariums: [makeTank()],
    currentAquariumId: 'tank-current',
    diagnosisRecords: [makePatrol(riskCode, '需要关注')],
    history: emptyHistory,
    now,
  });
  assert.equal(attention.priority.kind, 'daily_check_attention');
  assert.equal(attention.priority.summary, '需要关注');
  assert.equal(attention.priority.suggestedAction, '继续观察');
}

const otherTank = makeTank({ id: 'tank-other', name: '其他缸' });
const currentTank = makeTank({ id: 'tank-current', name: '当前缸' });
const eventHistory: KeepingHistorySnapshot = {
  ...emptyHistory,
  aquariumIds: ['tank-current', 'tank-other'],
  events: [
    {
      id: 'current-1',
      eventType: 'observation',
      occurredAt: '2026-10-23T10:00:00.000Z',
      title: '当前缸观察',
      aquariumId: 'tank-current',
      speciesIds: ['fish-a'],
      payload: {},
      isInferred: false,
    },
    {
      id: 'other-1',
      eventType: 'observation',
      occurredAt: '2026-10-23T09:00:00.000Z',
      title: '其他缸观察',
      aquariumId: 'tank-other',
      speciesIds: ['fish-a'],
      payload: {},
      isInferred: false,
    },
  ],
};

const selected = buildCollectionHomeModel({
  aquariums: [otherTank, currentTank],
  currentAquariumId: 'tank-current',
  diagnosisRecords: [],
  history: eventHistory,
  now,
});
assert.equal(selected.aquarium?.id, 'tank-current', 'current aquarium id must win over array order');
assert.deepEqual(selected.recentEvents.map(event => event.id), ['current-1'], 'recent story must stay scoped to the current aquarium');

console.log('collection home verified: conservative priority, current tank metrics, and tank-scoped story remain evidence-based');
