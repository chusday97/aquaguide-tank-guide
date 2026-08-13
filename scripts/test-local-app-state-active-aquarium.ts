import assert from 'node:assert/strict';

const storage = new Map<string, string>();
const localStorageStub = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, String(value)); },
  removeItem: (key: string) => { storage.delete(key); },
  clear: () => storage.clear(),
  key: (index: number) => Array.from(storage.keys())[index] ?? null,
  get length() { return storage.size; },
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageStub, configurable: true });
Object.defineProperty(globalThis, 'window', {
  value: {
    dispatchEvent: () => true,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  },
  configurable: true,
});

const { importLocalAppState } = await import('../src/services/storage/local-app-state');

const baseState = {
  version: 1 as const,
  currentAquariumId: 'aq_deleted',
  aquariums: [
    { id: 'aq_first', name: 'First tank', fishes: [] },
    { id: 'aq_second', name: 'Second tank', fishes: [] },
  ],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  careEvents: [],
  riskReminderState: {},
  onboarding: {
    version: 1 as const,
    status: 'completed' as const,
    viewedSpecies: true,
    aquariumConfigured: true,
    taskCardDismissed: false,
  },
  updatedAt: '2026-08-13T00:00:00.000Z',
};

const imported = importLocalAppState(JSON.stringify(baseState));
assert.equal(
  imported.currentAquariumId,
  'aq_first',
  `invalid active aquarium id must fall back to first existing aquarium, got ${imported.currentAquariumId}`,
);

const persisted = JSON.parse(storage.get('aquarium_app_state_v1') || '{}');
assert.equal(
  persisted.currentAquariumId,
  'aq_first',
  'normalized active aquarium id must be persisted, not only repaired in navigation memory',
);

const validImported = importLocalAppState(JSON.stringify({ ...baseState, currentAquariumId: 'aq_second' }));
assert.equal(validImported.currentAquariumId, 'aq_second', 'valid active aquarium id must be preserved');

const emptyImported = importLocalAppState(JSON.stringify({ ...baseState, currentAquariumId: 'aq_deleted', aquariums: [] }));
assert.equal(emptyImported.currentAquariumId, '', 'empty aquarium list must normalize active aquarium id to empty string');

console.log(JSON.stringify({
  ok: true,
  invalidFallback: imported.currentAquariumId,
  validPreserved: validImported.currentAquariumId,
  emptyFallback: emptyImported.currentAquariumId,
}, null, 2));
