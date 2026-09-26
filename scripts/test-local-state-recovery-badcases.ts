import assert from 'node:assert/strict';

class MemoryStorage {
  private store = new Map<string, string>();
  failWrites = false;
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error('quota exceeded');
    this.store.set(key, String(value));
  }
  removeItem(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

const storage = new MemoryStorage();
const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
const browserWindow = {
  location: { pathname: '/storage-badcase' },
  setTimeout: globalThis.setTimeout.bind(globalThis),
  clearTimeout: globalThis.clearTimeout.bind(globalThis),
  dispatchEvent: () => true,
  addEventListener: (name: string, fn: (...args: unknown[]) => void) => {
    const set = listeners.get(name) || new Set();
    set.add(fn);
    listeners.set(name, set);
  },
  removeEventListener: (name: string, fn: (...args: unknown[]) => void) => listeners.get(name)?.delete(fn),
};

Object.assign(globalThis, {
  localStorage: storage,
  window: browserWindow,
});

const {
  AQUARIUM_APP_STATE_KEY,
  AQUARIUM_APP_STATE_VERSION,
  importLocalAppState,
  loadAppStateFromStorage,
  saveAppStateToStorage,
} = await import('../src/services/storage/local-app-state');

// Corrupt primary state must not poison startup; valid legacy data is recovered.
storage.setItem(AQUARIUM_APP_STATE_KEY, '{ definitely-not-json');
storage.setItem('aquariums', JSON.stringify([{
  id: 'legacy-tank',
  name: '旧鱼缸',
  fishes: [],
  waterType: 'Freshwater',
}]));
storage.setItem('wishlistFishIds', JSON.stringify(['sp_0431']));
let state = loadAppStateFromStorage();
assert.equal(state.version, AQUARIUM_APP_STATE_VERSION);
assert.equal(state.aquariums.length, 1);
assert.equal(state.aquariums[0].id, 'legacy-tank');
assert.deepEqual(state.wishlist, ['sp_0431']);

// A parseable but structurally damaged primary snapshot is normalized fail-closed.
storage.setItem(AQUARIUM_APP_STATE_KEY, JSON.stringify({
  version: 999,
  currentAquariumId: 123,
  aquariums: { bad: true },
  wishlist: 'not-an-array',
  dismissedRecommendations: null,
  diagnosisRecords: 'bad',
  compatibilityRecords: {},
  deceasedRecords: 7,
  feedingRecords: null,
  observationRecords: 'bad',
  careEvents: {},
  riskReminderState: 'not-an-object',
  updatedAt: 42,
}));
state = loadAppStateFromStorage();
assert.equal(state.version, AQUARIUM_APP_STATE_VERSION);
assert.equal(state.currentAquariumId, '');
assert.deepEqual(state.aquariums, []);
assert.deepEqual(state.wishlist, []);
assert.deepEqual(state.diagnosisRecords, []);
assert.deepEqual(state.compatibilityRecords, []);
assert.deepEqual(state.deceasedRecords, []);
assert.deepEqual(state.feedingRecords, []);
assert.deepEqual(state.observationRecords, []);
assert.deepEqual(state.careEvents, []);
assert.deepEqual(state.riskReminderState, {});

// Invalid imports fail loudly instead of replacing healthy data with garbage.
assert.throws(() => importLocalAppState('{ broken'), /导入失败/);

// Immediate storage failures must surface to callers; never report a successful save.
storage.failWrites = true;
assert.throws(
  () => saveAppStateToStorage({
    ...state,
    updatedAt: new Date().toISOString(),
  }),
  /quota exceeded/,
);
storage.failWrites = false;

console.log('local state recovery badcases passed: malformed JSON, legacy fallback, damaged shape normalization and quota failure');
