import assert from 'node:assert/strict';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
}

const storage = new MemoryStorage();
let nextTimerId = 1;
const timers = new Map<number, () => void>();
const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
const browserWindow = {
  location: { pathname: '/cross-tab-badcase' },
  setTimeout: (fn: () => void) => {
    const id = nextTimerId++;
    timers.set(id, fn);
    return id;
  },
  clearTimeout: (id: number) => { timers.delete(id); },
  dispatchEvent: () => true,
  addEventListener: (name: string, fn: (...args: unknown[]) => void) => {
    const set = listeners.get(name) || new Set();
    set.add(fn);
    listeners.set(name, set);
  },
  removeEventListener: (name: string, fn: (...args: unknown[]) => void) => listeners.get(name)?.delete(fn),
};

Object.assign(globalThis, { localStorage: storage, window: browserWindow });

const {
  AQUARIUM_APP_STATE_KEY,
  loadAppStateFromStorage,
  patchLocalAppState,
  saveAppStateToStorage,
} = await import('../src/services/storage/local-app-state');

const first = patchLocalAppState({ wishlist: ['sp_0431'] });
const persistedFirst = loadAppStateFromStorage();
assert.equal(persistedFirst.updatedAt, first.updatedAt);

// Same-tab debounce patches must coalesce instead of dropping the earlier field.
patchLocalAppState({ currentAquariumId: 'tank-a' }, { debounce: true });
patchLocalAppState({ riskReminderState: { oxygen: 'watch' } }, { debounce: true });
assert.equal(timers.size, 1);
for (const fn of [...timers.values()]) fn();
timers.clear();
let state = loadAppStateFromStorage();
assert.equal(state.currentAquariumId, 'tank-a');
assert.deepEqual(state.riskReminderState, { oxygen: 'watch' });

// Schedule a stale tab write, then simulate another tab committing a newer snapshot.
const staleBase = loadAppStateFromStorage();
patchLocalAppState({ wishlist: ['sp_0431', 'stale-tab'] }, { debounce: true });
const newer = {
  ...staleBase,
  wishlist: ['sp_0431', 'newer-tab'],
  updatedAt: new Date(Date.parse(staleBase.updatedAt) + 1000).toISOString(),
};
storage.setItem(AQUARIUM_APP_STATE_KEY, JSON.stringify(newer));
for (const fn of [...timers.values()]) fn();
timers.clear();

state = loadAppStateFromStorage();
assert.deepEqual(state.wishlist, ['sp_0431', 'newer-tab'], 'stale delayed write must not overwrite a newer tab');
assert.equal(state.updatedAt, newer.updatedAt);

// Explicit optimistic write with an old revision must fail closed.
assert.throws(
  () => saveAppStateToStorage(
    { ...staleBase, wishlist: ['should-not-win'] },
    { expectedUpdatedAt: staleBase.updatedAt },
  ),
  /STALE_APP_STATE_WRITE/,
);
assert.deepEqual(loadAppStateFromStorage().wishlist, ['sp_0431', 'newer-tab']);

console.log('cross-tab local state badcases passed: debounce coalescing and stale-write rejection');
