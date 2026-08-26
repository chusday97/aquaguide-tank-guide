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

const { AQUARIUM_APP_STATE_KEY, loadDiscoveryDeckState, saveDiscoveryDeckState } = await import('../src/services/storage/local-app-state');

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

console.log('discovery storage boundary: canonical app-state and legacy compatibility passed');
