import assert from 'node:assert/strict';

class MemoryStorage {
  getItem() { return null; }
  setItem() {}
  removeItem() {}
}
const storage = new MemoryStorage();
const listeners = new Map<string, Set<(...args: any[]) => void>>();
const browserWindow = {
  location: { pathname: '/storage-lifecycle' },
  setTimeout: globalThis.setTimeout.bind(globalThis),
  clearTimeout: globalThis.clearTimeout.bind(globalThis),
  dispatchEvent: (event: { type: string }) => {
    for (const fn of listeners.get(event.type) || []) fn(event);
    return true;
  },
  addEventListener: (name: string, fn: (...args: any[]) => void) => {
    const set = listeners.get(name) || new Set();
    set.add(fn);
    listeners.set(name, set);
  },
  removeEventListener: (name: string, fn: (...args: any[]) => void) => listeners.get(name)?.delete(fn),
};
Object.assign(globalThis, { localStorage: storage, window: browserWindow });

const { AQUARIUM_APP_STATE_KEY, APP_STATE_CHANGED_EVENT, subscribeToAppState } =
  await import('../src/services/storage/local-app-state');

const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

let calls = 0;
const unsubscribe = subscribeToAppState(() => { calls += 1; });
assert.equal(listeners.get(APP_STATE_CHANGED_EVENT)?.size, 1);
assert.equal(listeners.get('storage')?.size, 1);

for (const fn of listeners.get('storage') || []) fn({ key: 'unrelated' });
await flush();
assert.equal(calls, 0, 'unrelated storage keys must be ignored');

for (let i = 0; i < 100; i += 1) {
  for (const fn of listeners.get('storage') || []) fn({ key: AQUARIUM_APP_STATE_KEY, newValue: JSON.stringify({ updatedAt: String(i) }) });
}
browserWindow.dispatchEvent({ type: APP_STATE_CHANGED_EVENT });
await flush();
assert.equal(calls, 1, 'storage/custom event storms in one turn must coalesce');

browserWindow.dispatchEvent({ type: APP_STATE_CHANGED_EVENT });
unsubscribe();
await flush();
assert.equal(calls, 1, 'scheduled notification must not fire after unsubscribe');
assert.equal(listeners.get(APP_STATE_CHANGED_EVENT)?.size, 0);
assert.equal(listeners.get('storage')?.size, 0);

console.log('storage subscription lifecycle passed: key filter, event-storm coalescing, and unsubscribe safety');
