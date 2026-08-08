import assert from 'node:assert/strict';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const localStorage = new MemoryStorage();
const eventTarget = new EventTarget();
const fakeWindow = Object.assign(eventTarget, { localStorage, setTimeout, clearTimeout });
Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: localStorage, configurable: true });

const care = await import('../src/services/care/care-activity.service');
const timeline = await import('../src/services/care/care-timeline.service');
const state = await import('../src/services/storage/local-app-state');

const aquarium = {
  id: 'tank-1',
  name: '测试缸',
  startedAt: '2026-07-01T08:00:00.000Z',
  startedAtSource: 'user' as const,
  fishes: [{
    id: 'stock-1', fishId: 'fish-1', quantity: 2, entryDate: '2026-07-02T08:00:00.000Z', lastWaterChangeDate: '2026-07-03T08:00:00.000Z',
    batches: [{ id: 'batch-1', quantity: 2, entryDate: '2026-07-02T08:00:00.000Z', lifeStage: 'adult' as const, reproductiveState: 'normal' as const, stateUpdatedAt: '2026-07-02T08:00:00.000Z' }],
  }],
  waterChangeHistory: ['2026-07-03'],
};
state.saveAppStateToStorage({
  version: 1,
  currentAquariumId: aquarium.id,
  aquariums: [aquarium],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  careEvents: [],
  riskReminderState: {},
  updatedAt: new Date().toISOString(),
});

timeline.recordCareTimelineEvent({
  aquariumId: aquarium.id,
  eventType: 'life_stage_updated',
  title: '调整体态',
  payload: {},
  occurredAt: '2026-07-04T08:00:00.000Z',
  sourceType: 'livestock_state',
  sourceId: 'state-1',
  isInferred: false,
});
timeline.recordCareTimelineEvent({
  aquariumId: aquarium.id,
  eventType: 'life_stage_updated',
  title: '调整体态（重试）',
  payload: {},
  occurredAt: '2026-07-04T08:00:00.000Z',
  sourceType: 'livestock_state',
  sourceId: 'state-1',
  isInferred: false,
});
assert.equal(state.loadAppStateFromStorage().careEvents?.length, 1, 'same source event must be idempotent');

const reminder = care.upsertCareReminder({
  sourceTopicId: 'routine-water_change',
  title: '换水计划',
  type: 'water_change',
  aquariumId: aquarium.id,
  scheduledFor: '2026-07-05T10:00:00.000Z',
  repeatEnabled: false,
});
const recurring = care.configureCareReminderRecurrence(reminder.id, true, 7);
assert.equal(recurring.repeatIntervalDays, 7);
care.completeCareReminder(reminder.id, '2026-07-05T10:00:00.000Z');
care.completeCareReminder(reminder.id, '2026-07-05T10:00:00.000Z');
const reminders = care.getCareReminders();
assert.equal(reminders.length, 2, 'repeated completion must not create duplicate next tasks');
const nextReminder = reminders.find(item => !item.completedAt)!;
assert.equal(nextReminder.scheduledFor, '2026-07-12T10:00:00.000Z');

const fish = {
  id: 'fish-1', name: '测试鱼', scientificName: 'Test fish', category: '小型鱼', image: '', difficulty: 'Easy' as const,
  waterTemperature: '24–26℃', phLevel: '6.5–7.5', waterChangeCycle: 7, description: '', diet: '', tankSize: '40L', temperament: 'Peaceful' as const, size: 'Small' as const,
};
const items = timeline.buildAquariumTimeline({
  aquarium,
  species: [fish],
  feedingRecords: [{ id: 'feed-1', aquariumId: aquarium.id, createdAt: '2026-07-04T09:00:00.000Z', type: 'feeding' }],
  diagnosisRecords: [{
    diagnosisId: 'check-1', aquariumId: aquarium.id, createdAt: '2026-07-04T10:00:00.000Z', problemType: '巡检', answers: {}, resultSummary: '状态正常', riskLevel: '低风险', suggestedActions: [], missingInfo: [], followUpNotes: [],
  }],
  reminders,
});
assert.deepEqual(new Set(items.map(item => item.eventType)), new Set(['aquarium_created', 'species_added', 'water_change', 'feeding', 'daily_check', 'care_plan_completed', 'life_stage_updated']));
assert.equal(items.every((item, index) => index === 0 || new Date(items[index - 1].occurredAt) >= new Date(item.occurredAt)), true, 'timeline must be newest first');
assert.equal(items.find(item => item.eventType === 'life_stage_updated')?.isInferred, false);
assert.equal(items.find(item => item.eventType === 'water_change')?.isInferred, true);

care.configureCareReminderRecurrence(nextReminder.id, false);
assert.equal(care.getCareReminders().find(item => item.id === nextReminder.id)?.repeatEnabled, false);
assert.equal(care.getCareReminders().some(item => item.id === reminder.id && item.completedAt), true, 'turning off recurrence must retain history');

console.log('care timeline and recurring reminders verified: derivation, deduplication, next task and history retention');
