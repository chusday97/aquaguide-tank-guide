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

const {
  recordSpeciesMemorial,
  updateSpeciesMemorial,
  recordSpeciesMemorialAndDecrementBatch,
} = await import('../src/services/collection/memorial.service');

assert.throws(
  () => recordSpeciesMemorial({ fishId: 'sp_0015', date: '2026-07-14', reason: '  ' }),
  /可能原因/,
);

assert.throws(
  () => recordSpeciesMemorial({ fishId: 'sp_0015', date: '2026-07-14', causeCodes: ['other'] }),
  /自定义原因/,
);

let stateChangeCount = 0;
window.addEventListener('aquaguide:app-state-changed', () => { stateChangeCount += 1; });
const result = recordSpeciesMemorial({
  fishId: 'sp_0015',
  date: '2026-07-14',
  causeCodes: ['temperature_stress', 'water_quality_change'],
  reason: '换水温差过大，后续先对温再缓慢换水',
  observation: '游动变慢并趴底',
  improvement: '换水前先对温，并减少单次换水量',
});

assert.equal(result.records.length, 1);
assert.deepEqual(result.record.causeCodes, ['temperature_stress', 'water_quality_change']);
assert.equal(result.record.reason, '换水温差过大，后续先对温再缓慢换水');
assert.equal(result.record.observation, '游动变慢并趴底');
assert.equal(result.record.improvement, '换水前先对温，并减少单次换水量');
assert.equal(result.record.version, 1);
assert.equal(stateChangeCount, 1);
assert.deepEqual(JSON.parse(localStorage.getItem('deceasedRecords') || '[]'), result.records);

const updated = updateSpeciesMemorial({
  id: result.record.id,
  causeCodes: ['unknown'],
  reason: '可能与换水温差有关',
  observation: '游动缓慢、趴底',
  improvement: '分次换水并记录温度',
});
assert.equal(updated.reason, '可能与换水温差有关');
assert.deepEqual(updated.causeCodes, ['unknown']);
assert.equal(updated.observation, '游动缓慢、趴底');
assert.equal(updated.improvement, '分次换水并记录温度');
assert.equal(updated.version, 2);
assert.equal(stateChangeCount, 2);

const legacyDirect = recordSpeciesMemorial({
  fishId: 'sp_0027',
  date: '2026-07-15',
  causeCodes: ['unknown'],
});
assert.equal(legacyDirect.record.fishId, 'sp_0001', 'legacy memorial writes must return the canonical species id');
assert.equal(legacyDirect.records.at(-1)?.fishId, 'sp_0001', 'legacy memorial storage must keep the canonical species id');

const legacyState = {
  version: 1,
  currentAquariumId: 'tank_legacy',
  aquariums: [{
    id: 'tank_legacy',
    name: 'Legacy tank',
    fishes: [{
      id: 'tank_fish_legacy',
      fishId: 'sp_0027',
      quantity: 2,
      entryDate: '2026-07-01T00:00:00.000Z',
      batches: [{
        id: 'batch_legacy',
        quantity: 2,
        entryDate: '2026-07-01T00:00:00.000Z',
        lifeStage: 'adult',
        reproductiveState: 'normal',
        stateUpdatedAt: '2026-07-01T00:00:00.000Z',
      }],
    }],
  }],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  careEvents: [],
  riskReminderState: {},
  updatedAt: '2026-07-15T00:00:00.000Z',
};
localStorage.setItem('aquarium_app_state_v1', JSON.stringify(legacyState));

const batchResult = recordSpeciesMemorialAndDecrementBatch({
  fishId: 'sp_0027',
  aquariumId: 'tank_legacy',
  aquariumFishId: 'tank_fish_legacy',
  batchId: 'batch_legacy',
  date: '2026-07-16',
  causeCodes: ['unknown'],
});
assert.equal(batchResult.record.fishId, 'sp_0001', 'legacy batch memorial must canonicalize the input id before matching');
assert.equal(batchResult.aquariums[0]?.fishes[0]?.fishId, 'sp_0001', 'legacy aquarium livestock id must remain canonical');
assert.equal(batchResult.aquariums[0]?.fishes[0]?.quantity, 1, 'legacy alias must not block the intended batch decrement');
assert.equal(batchResult.aquariums.length, 1, 'memorial batch update must not affect other aquarium records');

console.log('memorial service: structured review, canonical legacy ids, batch decrement, compatible storage and change events passed');
