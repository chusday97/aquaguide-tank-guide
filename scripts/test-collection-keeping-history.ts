import assert from 'node:assert/strict';
import type { LocalAppState, LocalCareEventRecord } from '../src/services/storage/local-app-state';
import { buildKeepingHistory } from '../src/services/collection/keeping-history.service';

const persistedAddition: LocalCareEventRecord = {
  id: 'tank-1:species_added:livestock_batch:batch-a',
  aquariumId: 'tank-1',
  eventType: 'species_added',
  title: '真实入缸记录',
  label: '2 只/条',
  payload: { speciesId: 'fish-a', quantity: 2 },
  occurredAt: '2026-07-02T08:00:00.000Z',
  sourceType: 'livestock_batch',
  sourceId: 'batch-a',
  isInferred: false,
};

const state: LocalAppState = {
  version: 1,
  currentAquariumId: 'tank-1',
  aquariums: [{
    id: 'tank-1',
    name: '履历测试缸',
    startedAt: '2026-07-01T08:00:00.000Z',
    startedAtSource: 'user',
    fishes: [{
      id: 'stock-a',
      fishId: 'fish-a',
      quantity: 2,
      entryDate: '2026-07-02T08:00:00.000Z',
      batches: [{
        id: 'batch-a',
        quantity: 2,
        entryDate: '2026-07-02T08:00:00.000Z',
        lifeStage: 'adult',
        reproductiveState: 'normal',
        stateUpdatedAt: '2026-07-02T08:00:00.000Z',
      }],
    }],
  }],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [{
    id: 'compat-1',
    aquariumId: 'tank-1',
    speciesIds: ['fish-a', 'fish-never-kept'],
    status: 'caution',
    scope: 'tank',
    evaluatedAt: '2026-07-06T08:00:00.000Z',
  }],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [{
    id: 'obs-1',
    aquariumId: 'tank-1',
    createdAt: '2026-07-05T08:00:00.000Z',
    type: 'observation',
    note: '进食正常',
  }],
  careEvents: [
    persistedAddition,
    {
      id: 'old-tank:species_removed:livestock_removal:remove-b',
      aquariumId: 'old-tank',
      eventType: 'species_removed',
      title: '移出旧缸生物',
      payload: { speciesId: 'fish-b', quantity: 1 },
      occurredAt: '2026-07-04T08:00:00.000Z',
      sourceType: 'livestock_removal',
      sourceId: 'remove-b',
      isInferred: false,
    },
    {
      id: 'old-tank:species_removed:livestock_removal:legacy-missing-species',
      aquariumId: 'old-tank',
      eventType: 'species_removed',
      title: '旧版无法识别物种的移出记录',
      payload: { aquariumFishId: 'missing-record', quantity: 1 },
      occurredAt: '2026-07-03T08:00:00.000Z',
      sourceType: 'livestock_removal',
      sourceId: 'legacy-missing-species',
      isInferred: false,
    },
  ],
  riskReminderState: {},
  updatedAt: '2026-07-06T09:00:00.000Z',
};

const history = buildKeepingHistory({
  appState: state,
  memorials: [{
    id: 'memorial-c',
    fishId: 'fish-c',
    date: '2026-07-07T08:00:00.000Z',
    reason: '已记录真实纪念',
  }],
  speciesCatalog: [{
    id: 'fish-a',
    name: '测试鱼 A',
    scientificName: 'Testus a',
    category: '小型鱼',
    image: '',
    difficulty: 'Easy',
    waterTemperature: '24–26℃',
    phLevel: '6.5–7.5',
    waterChangeCycle: 7,
    description: '',
    diet: '',
    tankSize: '40L',
    temperament: 'Peaceful',
    size: 'Small',
  }],
});

assert.equal(history.activeCohorts.length, 1);
assert.equal(history.activeCohorts[0].speciesId, 'fish-a');
assert.deepEqual(history.currentSpeciesIds, ['fish-a']);
assert.deepEqual(history.speciesEverKeptIds, ['fish-a', 'fish-b', 'fish-c']);
assert.equal(history.speciesEverKeptIds.includes('fish-never-kept'), false, 'compatibility-only species must not become kept history');
assert.equal(history.events.some(event => event.eventType === 'compatibility_decision'), true);
assert.equal(history.events.some(event => event.eventType === 'observation' && event.label === '进食正常'), true);
assert.equal(history.events.some(event => event.aquariumId === 'old-tank' && event.speciesIds.includes('fish-b')), true, 'orphan persisted history must survive after tank removal');
assert.equal(history.events.find(event => event.id === `care:${persistedAddition.id}`)?.title, '真实入缸记录', 'persisted truth must override inferred timeline copy');
assert.equal(history.events.every((event, index) => index === 0 || new Date(history.events[index - 1].occurredAt) >= new Date(event.occurredAt)), true, 'history must be newest first');
assert.equal(history.speciesEverKeptIds.includes('missing-record'), false, 'legacy record ids must never be guessed as species ids');

console.log('collection keeping history verified: real events project into cohorts, ever-kept species and ordered personal history without compatibility leakage or fabricated identity');
