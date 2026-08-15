import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

class MemoryStorage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const localStorage = new MemoryStorage();
const eventTarget = new EventTarget();
const fakeWindow = Object.assign(eventTarget, { localStorage, setTimeout, clearTimeout });
Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: localStorage, configurable: true });

const { LocalAquaGuideRepository } = await import('../src/services/repository/local-aquaguide.repository');
const {
  getWaterChangeHistoryFromEvents,
  hydrateAquariumWaterChangeHistory,
  waterChangeDateToIso,
} = await import('../src/services/aquarium/water-change.service');

const repository = new LocalAquaGuideRepository();
const aquarium = await repository.saveAquarium({
  id: 'water-tank',
  name: '换水测试缸',
  fishes: [{ id: 'stock-1', fishId: 'sp_0001', quantity: 2, entryDate: '2019-12-20' }],
});

const olderDate = '2020-01-10';
const newerDate = '2020-01-14';

let saved = await repository.setWaterChange({
  aquariumId: aquarium.id,
  date: olderDate,
  recorded: true,
  operationId: 'water-op-1',
});
assert.deepEqual(saved.waterChangeHistory, [olderDate]);
assert.equal(saved.lastWaterChangeDate, waterChangeDateToIso(olderDate));
assert.equal(saved.fishes[0]?.lastWaterChangeDate, waterChangeDateToIso(olderDate));
let events = await repository.getCareEvents(aquarium.id);
assert.equal(events.filter(event => event.sourceType === 'water_change_day' && event.sourceId === olderDate).length, 1);

saved = await repository.setWaterChange({
  aquariumId: aquarium.id,
  date: olderDate,
  recorded: true,
  operationId: 'water-op-1-replay',
});
events = await repository.getCareEvents(aquarium.id);
assert.equal(events.filter(event => event.sourceType === 'water_change_day' && event.sourceId === olderDate).length, 1, 'repeating the desired recorded state must not duplicate the canonical event');
assert.deepEqual(saved.waterChangeHistory, [olderDate]);

saved = await repository.setWaterChange({
  aquariumId: aquarium.id,
  date: newerDate,
  recorded: true,
  operationId: 'water-op-2',
});
assert.deepEqual(saved.waterChangeHistory, [olderDate, newerDate]);
assert.equal(saved.lastWaterChangeDate, waterChangeDateToIso(newerDate), 'newest recorded day must drive the aquarium summary');
assert.equal(saved.fishes[0]?.lastWaterChangeDate, waterChangeDateToIso(newerDate), 'livestock summary must move with the aquarium summary');

saved = await repository.setWaterChange({
  aquariumId: aquarium.id,
  date: newerDate,
  recorded: false,
  operationId: 'water-op-3',
});
assert.deepEqual(saved.waterChangeHistory, [olderDate]);
assert.equal(saved.lastWaterChangeDate, waterChangeDateToIso(olderDate), 'removing the newest day must roll the summary back to the previous canonical event');
assert.equal(saved.fishes[0]?.lastWaterChangeDate, waterChangeDateToIso(olderDate));

events = await repository.getCareEvents(aquarium.id);
assert.equal(events.some(event => event.sourceType === 'water_change_day' && event.sourceId === newerDate), false, 'removed water-change days must disappear from the canonical active event set');

saved = await repository.setWaterChange({
  aquariumId: aquarium.id,
  date: olderDate,
  recorded: false,
  operationId: 'water-op-4',
});
assert.deepEqual(saved.waterChangeHistory, []);
assert.equal(saved.lastWaterChangeDate, undefined, 'removing the final canonical day clears the aquarium summary');
assert.equal(saved.fishes[0]?.lastWaterChangeDate, undefined, 'removing the final canonical day clears livestock summaries');

await assert.rejects(
  repository.setWaterChange({ aquariumId: aquarium.id, date: '2099-01-01', recorded: true, operationId: 'water-future' }),
  /只能记录今天或过去实际发生的换水/,
  'local repository must reject future water-change dates',
);

const mixedEvents = [
  { aquariumId: aquarium.id, eventType: 'water_change', sourceType: 'water_change_day', sourceId: '2020-02-03' },
  { aquariumId: aquarium.id, eventType: 'water_change', sourceType: 'water_change_day', sourceId: '2020-02-01' },
  { aquariumId: aquarium.id, eventType: 'water_change', sourceType: 'water_change_day', sourceId: '2020-02-03' },
  { aquariumId: aquarium.id, eventType: 'water_change', sourceType: 'water_change_reversal', sourceId: '2020-02-04' },
  { aquariumId: 'other-tank', eventType: 'water_change', sourceType: 'water_change_day', sourceId: '2020-02-05' },
  { aquariumId: aquarium.id, eventType: 'feeding', sourceType: 'water_change_day', sourceId: '2020-02-06' },
  { aquariumId: aquarium.id, eventType: 'water_change', sourceType: 'water_change_day', sourceId: 'not-a-date' },
];
assert.deepEqual(getWaterChangeHistoryFromEvents(aquarium.id, mixedEvents), ['2020-02-01', '2020-02-03']);
const hydrated = hydrateAquariumWaterChangeHistory({ ...aquarium, waterChangeHistory: [] }, mixedEvents);
assert.deepEqual(hydrated.waterChangeHistory, ['2020-02-01', '2020-02-03']);
assert.equal(hydrated.lastWaterChangeDate, waterChangeDateToIso('2020-02-03'));

const repositoryContractSource = readFileSync(resolve('src/services/repository/aquaguide.repository.ts'), 'utf8');
const apiRepositorySource = readFileSync(resolve('src/services/repository/api-aquaguide.repository.ts'), 'utf8');
const aquariumApiSource = readFileSync(resolve('apps/api/src/routes/aquariums.ts'), 'utf8');
const aquariumPageSource = readFileSync(resolve('src/pages/Aquarium.tsx'), 'utf8');
const migrationSource = readFileSync(resolve('supabase/migrations/20260815115240_atomic_water_change_record.sql'), 'utf8');

assert.match(repositoryContractSource, /setWaterChange\(input: WaterChangeMutation\): Promise<Aquarium>/, 'repository contract must own the water-change mutation');
assert.match(apiRepositorySource, /async setWaterChange\(input: WaterChangeMutation\)/, 'cloud repository must implement water-change mutation');
assert.match(apiRepositorySource, /\/water-changes\/\$\{input\.date\}/, 'cloud repository must call the dedicated water-change endpoint');
assert.match(aquariumApiSource, /put\('\/aquariums\/:id\/water-changes\/:localDate'/, 'API must expose one dedicated water-change write boundary');
assert.match(aquariumApiSource, /rpc\('set_aquarium_water_change_day'/, 'API must delegate the multi-table write to the atomic database function');
assert.match(aquariumPageSource, /await repository\.setWaterChange\(/, 'page must persist water changes through the active repository');
assert.match(aquariumPageSource, /hydrateAquariumWaterChangeHistory\(aquarium, repositoryEvents\)/, 'cloud reload must reconstruct full water-change history from canonical care events');
assert.doesNotMatch(aquariumPageSource, /const saveAquariums =/, 'page must not retain a generic local-only aquarium write helper');

const liveHandlerStart = aquariumPageSource.indexOf('const setWaterChangeRecorded = async');
const liveHandlerEnd = aquariumPageSource.indexOf('const handleDailyActionPrimary', liveHandlerStart);
assert.ok(liveHandlerStart >= 0 && liveHandlerEnd > liveHandlerStart, 'live water-change handler must be discoverable');
const liveHandlerSource = aquariumPageSource.slice(liveHandlerStart, liveHandlerEnd);
assert.doesNotMatch(liveHandlerSource, /persistCareTimelineEvent|removeCareTimelineEventBySource/, 'water-change UI must not perform a client-side two-request event/summary write');
assert.match(liveHandlerSource, /repository\.getCareEvents\(/, 'timeline must be refreshed from the repository after the atomic mutation');

assert.match(migrationSource, /security invoker/, 'water-change RPC must preserve caller RLS context');
assert.match(migrationSource, /set search_path = ''/, 'water-change RPC must pin an empty search path');
assert.match(migrationSource, /pg_advisory_xact_lock/, 'water-change RPC must serialize concurrent writes for the same aquarium');
assert.match(migrationSource, /for update/, 'water-change RPC must lock the target aquarium row');
assert.match(migrationSource, /insert into public\.care_events/, 'recording must create the canonical care event inside the transaction');
assert.match(migrationSource, /update public\.care_events[\s\S]*set deleted_at = now\(\)/, 'removing a day must soft-delete the canonical care event inside the transaction');
assert.match(migrationSource, /select max\(occurred_at\) into latest_at/, 'latest summary must be derived from canonical active event timestamps');
assert.match(migrationSource, /update public\.aquariums[\s\S]*last_water_change_at = latest_at/, 'aquarium summary must update inside the same transaction');
assert.match(migrationSource, /update public\.aquarium_species[\s\S]*last_water_change_at = latest_at/, 'livestock summaries must update inside the same transaction');
assert.match(migrationSource, /insert into public\.idempotency_records/, 'water-change transaction must persist replay protection');
assert.match(migrationSource, /revoke all on function public\.set_aquarium_water_change_day[\s\S]*from public;/, 'RPC must not retain default PUBLIC execute access');
assert.match(migrationSource, /grant execute on function public\.set_aquarium_water_change_day[\s\S]*to authenticated;/, 'RPC execute access must be limited to authenticated users');
assert.ok(
  migrationSource.indexOf('update public.aquarium_species') < migrationSource.indexOf('insert into public.idempotency_records'),
  'canonical event and summaries must commit before the replay record inside the same transaction',
);

console.log('water-change repository boundary: local behavior, event-derived history and atomic cloud persistence verified');
