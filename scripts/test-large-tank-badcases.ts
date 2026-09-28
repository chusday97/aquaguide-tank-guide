import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import type { Aquarium } from '../src/types';

const candidate = fishData[0];
assert.ok(candidate);
const existing = fishData.slice(1, 401).map(species => ({ species, record: { quantity: 1 } }));
const tank: Aquarium = {
  id: 'large-tank',
  name: 'large badcase tank',
  fishes: [],
  dimensions: { length: '200', width: '80', height: '60' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const result = evaluateTankCompatibility({
  tank,
  existingSpecies: existing,
  candidateSpecies: candidate,
  candidateQuantity: 1,
});
assert.ok(['compatible', 'caution', 'not_recommended', 'insufficient_data'].includes(result.status));
assert.ok(result.summary.length < 500, 'large tank summary must stay bounded for users');
assert.ok(result.suggestions.length <= 5, 'large tank actions must stay bounded');
assert.equal(new Set(result.suggestions).size, result.suggestions.length, 'large tank actions must be deduplicated');

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
}
const storage = new MemoryStorage();
const browserWindow = {
  location: { pathname: '/large-tank-badcase' },
  setTimeout: globalThis.setTimeout.bind(globalThis),
  clearTimeout: globalThis.clearTimeout.bind(globalThis),
  dispatchEvent: () => true,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
};
Object.assign(globalThis, { localStorage: storage, window: browserWindow });
const { loadAppStateFromStorage, saveAppStateToStorage } = await import('../src/services/storage/local-app-state');

const largeAquarium: Aquarium = {
  ...tank,
  fishes: fishData.slice(0, 400).map((species, index) => ({
    id: 'record-' + index,
    fishId: species.id,
    quantity: 1,
    entryDate: '2026-08-01T00:00:00.000Z',
  })),
};
const base = loadAppStateFromStorage();
saveAppStateToStorage({ ...base, aquariums: [largeAquarium] });
const roundTrip = loadAppStateFromStorage();
assert.equal(roundTrip.aquariums[0]?.fishes.length, 400, 'large aquarium records must round-trip without truncation');

console.log('large tank badcases passed: 400-species add evaluation remains bounded and 400 records round-trip');
