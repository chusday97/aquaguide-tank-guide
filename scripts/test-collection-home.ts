import assert from 'node:assert/strict';
import type { KeepingHistorySnapshot } from '../src/modules/collection/collection.types';
import type { DiagnosisRecord } from '../src/modules/diagnosis/diagnosis.types';
import type { CareReminderRecord } from '../src/services/care/care-activity.service';
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

type DiagnosisOverrides = Partial<DiagnosisRecord> & {
  riskCode?: DiagnosisRecord['riskCode'];
};

const makeDiagnosis = (overrides: DiagnosisOverrides = {}): DiagnosisRecord => ({
  diagnosisId: overrides.diagnosisId || 'diagnosis-1',
  aquariumId: overrides.aquariumId || 'tank-current',
  problemType: overrides.problemType || '巡检',
  createdAt: overrides.createdAt || '2026-10-23T08:00:00.000Z',
  answers: {},
  resultSummary: overrides.resultSummary || '巡检记录',
  riskLevel: overrides.riskLevel || overrides.riskCode || 'low',
  riskCode: overrides.riskCode ?? 'low',
  conclusion: overrides.conclusion ?? overrides.resultSummary ?? '巡检记录',
  suggestedActions: overrides.suggestedActions || ['继续观察'],
  avoidActions: overrides.avoidActions || [],
  observeItems: overrides.observeItems || [],
  missingInfo: overrides.missingInfo || [],
  nextCheckAt: overrides.nextCheckAt,
  followUpNotes: overrides.followUpNotes || [],
});

const makeReminder = (overrides: Partial<CareReminderRecord> = {}): CareReminderRecord => ({
  id: overrides.id || 'reminder-1',
  sourceTopicId: overrides.sourceTopicId || 'care-topic-1',
  title: overrides.title || '观察新鱼状态',
  type: overrides.type || 'care',
  createdAt: overrides.createdAt || '2026-10-20T08:00:00.000Z',
  scheduledFor: overrides.scheduledFor || '2026-10-23T09:00:00.000Z',
  aquariumId: overrides.aquariumId ?? 'tank-current',
  label: overrides.label,
  completedAt: overrides.completedAt,
  seriesId: overrides.seriesId,
  repeatEnabled: overrides.repeatEnabled,
  repeatIntervalDays: overrides.repeatIntervalDays,
});

const build = (input: {
  aquariums?: Aquarium[];
  currentAquariumId?: string;
  diagnosisRecords?: DiagnosisRecord[];
  reminders?: CareReminderRecord[];
  history?: KeepingHistorySnapshot;
}) => buildCollectionHomeModel({
  aquariums: input.aquariums ?? [makeTank()],
  currentAquariumId: input.currentAquariumId ?? 'tank-current',
  diagnosisRecords: input.diagnosisRecords ?? [],
  reminders: input.reminders ?? [],
  history: input.history ?? emptyHistory,
  now,
});

const noTank = build({ aquariums: [], currentAquariumId: '' });
assert.equal(noTank.priority.kind, 'setup_aquarium');
assert.equal(noTank.aquarium, null);

const emptyTank = build({ aquariums: [makeTank({ fishes: [] })] });
assert.equal(emptyTank.priority.kind, 'add_resident');

const idle = build({});
assert.equal(idle.priority.kind, 'no_priority_task', 'absence of evidence must not manufacture a daily task or imply stability');
assert.equal(idle.speciesCount, 2, 'species count must be unique by fishId');
assert.equal(idle.residentCount, 6, 'resident count must sum live quantities');
assert.equal(idle.volumeLiters, 54);
assert.equal(idle.daysRunning, 3);

const recorded = build({
  diagnosisRecords: [makeDiagnosis({ riskCode: 'low', resultSummary: '今日未见明显异常' })],
});
assert.equal(recorded.priority.kind, 'daily_check_recorded');
assert.equal(recorded.priority.summary, '今日未见明显异常');

for (const riskCode of ['medium', 'high', 'unknown'] as const) {
  const attention = build({
    diagnosisRecords: [makeDiagnosis({
      riskCode,
      resultSummary: '需要关注',
      problemType: '鱼只异常',
      suggestedActions: ['继续观察呼吸状态'],
    })],
  });
  assert.equal(attention.priority.kind, 'diagnosis_attention');
  assert.equal(attention.priority.summary, '需要关注');
  assert.equal(attention.priority.suggestedAction, '继续观察呼吸状态');
  assert.equal(attention.priority.sourceTitle, '鱼只异常');
}

const resolvedOldRisk = build({
  diagnosisRecords: [
    makeDiagnosis({
      diagnosisId: 'old-risk',
      problemType: '鱼只异常',
      createdAt: '2026-10-21T08:00:00.000Z',
      riskCode: 'high',
      resultSummary: '两天前有异常',
    }),
    makeDiagnosis({
      diagnosisId: 'resolved-later',
      problemType: '鱼只异常',
      createdAt: '2026-10-22T08:00:00.000Z',
      riskCode: 'low',
      resultSummary: '后续复查已无明显异常',
    }),
  ],
});
assert.equal(resolvedOldRisk.priority.kind, 'no_priority_task', 'newer low-risk record for the same problem must supersede stale risk');

const followUp = build({
  diagnosisRecords: [makeDiagnosis({
    diagnosisId: 'follow-up',
    problemType: '水体异常',
    createdAt: '2026-10-22T08:00:00.000Z',
    riskCode: 'low',
    resultSummary: '已处理，等待复查',
    nextCheckAt: '2026-10-23T14:00:00.000Z',
    followUpNotes: ['确认水体是否重新清澈'],
  })],
});
assert.equal(followUp.priority.kind, 'follow_up_due');
assert.equal(followUp.priority.summary, '确认水体是否重新清澈');

const overdueReminder = build({
  reminders: [makeReminder({
    id: 'overdue',
    title: '复查过滤棉',
    scheduledFor: '2026-10-22T09:00:00.000Z',
  })],
});
assert.equal(overdueReminder.priority.kind, 'care_reminder_overdue');
assert.equal(overdueReminder.priority.sourceTitle, '复查过滤棉');

const todayReminder = build({
  reminders: [makeReminder({
    id: 'today',
    title: '观察新鱼状态',
    scheduledFor: '2026-10-23T14:30:00.000Z',
  })],
});
assert.equal(todayReminder.priority.kind, 'care_reminder_today');

const ignoredReminders = build({
  reminders: [
    makeReminder({
      id: 'completed',
      completedAt: '2026-10-23T08:00:00.000Z',
      scheduledFor: '2026-10-22T08:00:00.000Z',
    }),
    makeReminder({
      id: 'other-tank',
      aquariumId: 'tank-other',
      scheduledFor: '2026-10-22T08:00:00.000Z',
    }),
  ],
});
assert.equal(ignoredReminders.priority.kind, 'no_priority_task', 'completed or other-tank reminders must not leak into the current tank');

const recentAddedHistory: KeepingHistorySnapshot = {
  ...emptyHistory,
  aquariumIds: ['tank-current'],
  events: [{
    id: 'added-explicit',
    eventType: 'species_added',
    occurredAt: '2026-10-22T12:30:00.000Z',
    title: '加入新成员',
    label: '加入 6 条新鱼',
    aquariumId: 'tank-current',
    speciesIds: ['fish-c'],
    payload: {},
    isInferred: false,
  }],
};
assert.equal(build({ history: recentAddedHistory }).priority.kind, 'new_resident_observation');

const inferredAddedHistory: KeepingHistorySnapshot = {
  ...recentAddedHistory,
  events: [{ ...recentAddedHistory.events[0], id: 'added-inferred', isInferred: true }],
};
assert.equal(build({ history: inferredAddedHistory }).priority.kind, 'no_priority_task', 'inferred history must not manufacture an observation task');

const tooOldAddedHistory: KeepingHistorySnapshot = {
  ...recentAddedHistory,
  events: [{ ...recentAddedHistory.events[0], id: 'added-old', occurredAt: '2026-10-19T11:00:00.000Z' }],
};
assert.equal(build({ history: tooOldAddedHistory }).priority.kind, 'no_priority_task', 'new-resident observation window is limited to 72 hours');

const orderingReminder = makeReminder({ id: 'ordering-reminder', scheduledFor: '2026-10-22T09:00:00.000Z' });

const riskWins = build({
  diagnosisRecords: [makeDiagnosis({ riskCode: 'high', problemType: '鱼只异常' })],
  reminders: [orderingReminder],
  history: recentAddedHistory,
});
assert.equal(riskWins.priority.kind, 'diagnosis_attention', 'unresolved risk must outrank reminders and new-resident observation');

const followUpWins = build({
  diagnosisRecords: [makeDiagnosis({
    createdAt: '2026-10-22T08:00:00.000Z',
    riskCode: 'low',
    nextCheckAt: '2026-10-23T10:00:00.000Z',
    followUpNotes: ['复查'],
  })],
  reminders: [orderingReminder],
  history: recentAddedHistory,
});
assert.equal(followUpWins.priority.kind, 'follow_up_due', 'explicit follow-up must outrank care reminders');

const reminderWins = build({
  reminders: [orderingReminder],
  history: recentAddedHistory,
});
assert.equal(reminderWins.priority.kind, 'care_reminder_overdue', 'due care reminder must outrank new-resident observation');

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

const selected = build({
  aquariums: [otherTank, currentTank],
  currentAquariumId: 'tank-current',
  history: eventHistory,
});
assert.equal(selected.aquarium?.id, 'tank-current', 'current aquarium id must win over array order');
assert.deepEqual(selected.recentEvents.map(event => event.id), ['current-1'], 'recent story must stay scoped to the current aquarium');

console.log('collection home verified: one evidence-based priority, explicit follow-up/reminder/new-resident ordering, and no fabricated tank task');
