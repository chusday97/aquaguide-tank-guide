import assert from 'node:assert/strict';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
}

const storage = new MemoryStorage();
const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
const browserWindow = {
  location: { pathname: '/import-badcase' },
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
Object.assign(globalThis, { localStorage: storage, window: browserWindow });

const {
  AQUARIUM_APP_STATE_KEY,
  LOCAL_APP_STATE_IMPORT_MAX_BYTES,
  exportLocalAppState,
  importLocalAppState,
  loadAppStateFromStorage,
  patchLocalAppState,
} = await import('../src/services/storage/local-app-state');

patchLocalAppState({ wishlist: ['sp_0431'], cloudMigrationConfirmed: true });
const before = storage.getItem(AQUARIUM_APP_STATE_KEY);
assert.ok(before);

for (const bad of [
  '{bad json',
  '[]',
  '{}',
  JSON.stringify({ version: 1 }),
  JSON.stringify({ version: 1, updatedAt: '2026-09-24T00:00:00.000Z' }),
  JSON.stringify({ version: 2, wishlist: [] }),
  JSON.stringify({ version: 1, wishlist: [1, 2] }),
  JSON.stringify({ version: 1, aquariums: [{ id: 'a', name: 'A', fishes: 'bad' }] }),
  JSON.stringify({ version: 1, riskReminderState: [] }),
]) {
  assert.throws(() => importLocalAppState(bad));
  assert.equal(storage.getItem(AQUARIUM_APP_STATE_KEY), before, 'rejected import must not mutate current state');
}

assert.throws(
  () => importLocalAppState('x'.repeat(LOCAL_APP_STATE_IMPORT_MAX_BYTES + 1)),
  /过大|无效/,
);
assert.equal(storage.getItem(AQUARIUM_APP_STATE_KEY), before);

const legacy = JSON.stringify({
  aquariums: [{ id: 'legacy-tank', name: 'Legacy', fishes: [] }],
  wishlist: ['sp_0001'],
  cloudMigrationConfirmed: true,
});
const imported = importLocalAppState(legacy);
assert.equal(imported.aquariums[0]?.id, 'legacy-tank');
assert.deepEqual(imported.wishlist, ['sp_0001']);
assert.equal(imported.cloudMigrationConfirmed, false, 'imported local data must require explicit cloud migration confirmation');

const exported = exportLocalAppState();
const parsedExport = JSON.parse(exported);
assert.equal(parsedExport.version, 1);
assert.equal(parsedExport.aquariums[0].id, 'legacy-tank');

console.log('local state import badcases passed: malformed/future/oversized data rejected, legacy accepted, cloud authority reset');
