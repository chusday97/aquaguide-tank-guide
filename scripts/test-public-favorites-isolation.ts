import assert from 'node:assert/strict';

const reads: string[] = [];
const writes: string[] = [];
const values = new Map<string, string>([
  ['wishlistFishIds', JSON.stringify(['sp_0001'])],
  ['aquarium_app_state_v1', JSON.stringify({ wishlist: ['sp_0432'], aquariums: [{ id: 'private-tank' }] })],
]);

const listeners = new Map<string, Set<() => void>>();
const fakeWindow = {
  localStorage: {
    getItem(key: string) {
      reads.push(key);
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      writes.push(key);
      values.set(key, value);
    },
  },
  addEventListener(type: string, listener: () => void) {
    const current = listeners.get(type) ?? new Set<() => void>();
    current.add(listener);
    listeners.set(type, current);
  },
  removeEventListener() {},
  dispatchEvent() { return true; },
};

Object.assign(globalThis, { window: fakeWindow });
const { getPublicSpeciesFavoriteIds, togglePublicSpeciesFavorite } = await import('../src/services/favorites/public-species-favorites.service.ts');

assert.deepEqual(getPublicSpeciesFavoriteIds(), ['sp_0001']);
assert.deepEqual(reads, ['wishlistFishIds']);

togglePublicSpeciesFavorite('sp_0002');
assert.deepEqual(writes, ['wishlistFishIds']);
assert.equal(reads.includes('aquarium_app_state_v1'), false);
assert.equal(writes.includes('aquarium_app_state_v1'), false);
assert.deepEqual(JSON.parse(values.get('wishlistFishIds') || '[]').sort(), ['sp_0001', 'sp_0002']);

console.log('Public favorites isolation passed: only wishlistFishIds was read and written.');
