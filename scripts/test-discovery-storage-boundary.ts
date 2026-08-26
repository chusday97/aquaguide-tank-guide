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
  AQUARIUM_APP_STATE_KEY,
  clearLocalAppState,
  loadDiscoveryDeckState,
  patchLocalAppState,
  saveDiscoveryDeckState,
  subscribeToAppState,
} = await import('../src/services/storage/local-app-state');

const legacyState = {
  dateKey: '2099-01-01',
  queueIds: ['legacy-species'],
  consumedIds: [],
  history: [],
  sceneBatchIds: ['legacy-scene'],
  sceneSeenIds: [],
  sceneBatchIndex: 0,
  sceneComplete: false,
};
localStorage.setItem('aquapediaDiscoveryDeck', JSON.stringify(legacyState));
assert.deepEqual(loadDiscoveryDeckState(), legacyState, 'legacy discovery key must remain readable');
localStorage.setItem(AQUARIUM_APP_STATE_KEY, JSON.stringify({ version: 1, wishlist: [], updatedAt: new Date().toISOString() }));
patchLocalAppState({ wishlist: ['legacy-compatible-fish'] });
assert.deepEqual(loadDiscoveryDeckState(), legacyState, 'an unrelated save must preserve legacy discovery during migration');

const canonicalState = {
  dateKey: '2099-01-01',
  queueIds: ['canonical-species'],
  consumedIds: ['consumed-species'],
  history: [{ id: 'canonical-species', dateKey: '2099-01-01' }],
  sceneBatchIds: ['canonical-scene'],
  sceneSeenIds: ['canonical-species'],
  sceneBatchIndex: 1,
  sceneComplete: false,
};
let changeEvents = 0;
window.addEventListener('aquaguide:app-state-changed', () => { changeEvents += 1; });
saveDiscoveryDeckState(canonicalState);

const persisted = JSON.parse(localStorage.getItem(AQUARIUM_APP_STATE_KEY) || '{}');
assert.deepEqual(persisted.discoveryState, canonicalState, 'discovery writes must be included in canonical app state');
assert.deepEqual(loadDiscoveryDeckState(), canonicalState, 'canonical app state must win over stale legacy key');
assert.deepEqual(JSON.parse(localStorage.getItem('aquapediaDiscoveryDeck') || '{}'), canonicalState, 'legacy key must mirror canonical state for compatibility');
assert.equal(changeEvents, 1, 'canonical discovery save must emit one app-state change event');

clearLocalAppState();
saveAppStateFixture({ wishlist: ['existing-fish'] });
saveDiscoveryDeckState(canonicalState, { debounce: true });
patchLocalAppState({ wishlist: ['new-fish'] });
await new Promise(resolve => setTimeout(resolve, 750));
const mergedAfterImmediatePatch = JSON.parse(localStorage.getItem(AQUARIUM_APP_STATE_KEY) || '{}');
assert.deepEqual(mergedAfterImmediatePatch.discoveryState, canonicalState, 'an immediate patch must not discard queued discovery state');
assert.deepEqual(mergedAfterImmediatePatch.wishlist, ['new-fish'], 'an immediate patch must be persisted with queued discovery state');

clearLocalAppState();
saveAppStateFixture({ wishlist: ['existing-fish'] });
saveDiscoveryDeckState(canonicalState, { debounce: true });
patchLocalAppState({ wishlist: ['debounced-fish'] }, { debounce: true });
await new Promise(resolve => setTimeout(resolve, 750));
const mergedDebounced = JSON.parse(localStorage.getItem(AQUARIUM_APP_STATE_KEY) || '{}');
assert.deepEqual(mergedDebounced.discoveryState, canonicalState, 'two debounced patches must be merged');
assert.deepEqual(mergedDebounced.wishlist, ['debounced-fish'], 'latest debounced patch must be persisted');

clearLocalAppState();
saveAppStateFixture({ wishlist: ['existing-fish'] });
saveDiscoveryDeckState(canonicalState, { debounce: true });
const externalUpdate = JSON.parse(localStorage.getItem(AQUARIUM_APP_STATE_KEY) || '{}');
externalUpdate.wishlist = ['external-fish'];
localStorage.setItem(AQUARIUM_APP_STATE_KEY, JSON.stringify(externalUpdate));
await new Promise(resolve => setTimeout(resolve, 750));
const mergedExternal = JSON.parse(localStorage.getItem(AQUARIUM_APP_STATE_KEY) || '{}');
assert.deepEqual(mergedExternal.discoveryState, canonicalState, 'queued discovery state must survive an external update');
assert.deepEqual(mergedExternal.wishlist, ['external-fish'], 'external updates to unrelated fields must survive the flush');

let clearEvents = 0;
const unsubscribe = subscribeToAppState(() => { clearEvents += 1; });
const legacyStorageEvent = new Event('storage');
Object.defineProperty(legacyStorageEvent, 'key', { value: 'aquapediaDiscoveryDeck' });
window.dispatchEvent(legacyStorageEvent);
assert.equal(clearEvents, 1, 'legacy discovery storage changes must notify app-state subscribers');
const unrelatedStorageEvent = new Event('storage');
Object.defineProperty(unrelatedStorageEvent, 'key', { value: 'unrelated-key' });
window.dispatchEvent(unrelatedStorageEvent);
assert.equal(clearEvents, 1, 'unrelated storage changes must not notify app-state subscribers');
clearLocalAppState();
await new Promise(resolve => setTimeout(resolve, 750));
unsubscribe();
assert.equal(loadDiscoveryDeckState(), undefined, 'clearing local state must clear canonical and legacy discovery state');
assert.equal(clearEvents, 2, 'clearing local state must notify app-state subscribers once');

function saveAppStateFixture(patch: { wishlist: string[] }) {
  patchLocalAppState(patch);
}

console.log('discovery storage boundary: canonical, legacy, interleaving, external-update, and storage-event cases passed');
