import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import type { Aquarium, Fish } from '../src/types';
import { aquariumSpeciesCreateSchema } from '../packages/contracts/src/business';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const localStorage = new MemoryStorage();
const fakeWindow = Object.assign(new EventTarget(), { localStorage, setTimeout, clearTimeout });
Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: localStorage, configurable: true });

const { LocalAquaGuideRepository } = await import('../src/services/repository/local-aquaguide.repository');
const { recordExistingLivestock } = await import('../src/services/aquarium/livestock-recording.service');
const { assessSpeciesAddition, preparePlannedAddition } = await import('../src/services/aquarium/species-addition.service');

const makeFish = (overrides: Partial<Fish> = {}): Fish => ({
  id: 'candidate-fish',
  name: '候选测试鱼',
  scientificName: 'Testus candidate',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '6.0-8.0',
  waterChangeCycle: 7,
  description: '测试物种',
  diet: '杂食',
  tankSize: '至少 20 升',
  temperament: 'Peaceful',
  size: 'Small',
  ...overrides,
});

const migration = await readFile(new URL('../supabase/migrations/20260816103423_unresolved_existing_livestock.sql', import.meta.url), 'utf8');
assert.match(migration, /identity_status public\.livestock_identity_status not null default 'verified'/);
assert.match(migration, /add column raw_name text/);
assert.match(migration, /alter column species_catalog_key drop not null/);
assert.match(migration, /identity_status = 'unresolved'[\s\S]*species_id is null[\s\S]*species_catalog_key is null[\s\S]*raw_name is not null/);
assert.match(migration, /create or replace function public\.add_unresolved_aquarium_livestock/);
assert.match(migration, /security invoker/);
assert.match(migration, /grant execute on function public\.add_unresolved_aquarium_livestock[\s\S]*to authenticated/);
assert.doesNotMatch(
  migration.slice(migration.indexOf('create or replace function public.add_unresolved_aquarium_livestock')),
  /from public\.species[\s\S]*status = 'published'/,
  'recording an unresolved real-world animal must not require a fabricated catalog record',
);

const legacyVerified = aquariumSpeciesCreateSchema.parse({
  speciesCatalogKey: 'candidate-fish',
  quantity: 1,
  entryDate: '2026-08-16',
});
assert.equal(legacyVerified.identityStatus, 'verified');
assert.equal(legacyVerified.speciesCatalogKey, 'candidate-fish');

const unresolvedInput = aquariumSpeciesCreateSchema.parse({
  identityStatus: 'unresolved',
  rawName: '黄金胡子',
  quantity: 2,
  entryDate: '2026-08-16',
});
assert.equal(unresolvedInput.identityStatus, 'unresolved');
assert.equal(unresolvedInput.rawName, '黄金胡子');
assert.equal('speciesCatalogKey' in unresolvedInput, false);
assert.equal(aquariumSpeciesCreateSchema.safeParse({
  identityStatus: 'unresolved',
  rawName: '',
  quantity: 2,
  entryDate: '2026-08-16',
}).success, false);
assert.equal(aquariumSpeciesCreateSchema.safeParse({
  identityStatus: 'unresolved',
  rawName: '黄金胡子',
  speciesCatalogKey: 'pretend-canonical-id',
  quantity: 2,
  entryDate: '2026-08-16',
}).success, false, 'unresolved reality must not carry a fake canonical catalog key');

const repository = new LocalAquaGuideRepository();
const created = await repository.createAquarium({
  name: '未确认物种测试缸',
  startedAt: '2026-08-16',
  startedAtSource: 'created',
  operationId: 'create-unresolved-test',
});
const saved = await repository.addLivestock({
  aquariumId: created.id,
  identityStatus: 'unresolved',
  rawName: '黄金胡子',
  quantity: 2,
  entryDate: '2026-08-16',
  operationId: 'record-unresolved-direct',
});
assert.equal(saved.fishes.length, 1);
assert.equal(saved.fishes[0].identityStatus, 'unresolved');
assert.equal(saved.fishes[0].rawName, '黄金胡子');
assert.match(saved.fishes[0].fishId, /^unresolved:/, 'legacy mirror key must be explicitly namespaced and never look canonical');

const recorded = await recordExistingLivestock({
  repository,
  aquarium: saved,
  items: [{ identityStatus: 'unresolved', rawName: '神仙鱼幼体（品种待确认）', quantity: 1, entryDate: '2026-08-16' }],
  speciesCatalog: [makeFish()],
  operationId: 'record-unresolved-service',
});
assert.equal(recorded.failedItems.length, 0);
assert.ok(recorded.aquarium.fishes.some(item => item.identityStatus === 'unresolved' && item.rawName === '神仙鱼幼体（品种待确认）'));
assert.equal(recorded.assessment, null, 'an unresolved real-world record must not be wrapped in a fake complete compatibility assessment');
assert.match(recorded.assessmentFailure || '', /未确认/);

const candidate = makeFish();
const configured: Aquarium = {
  ...recorded.aquarium,
  waterType: 'Freshwater',
  dimensions: { length: '60', width: '30', height: '30' },
  targetTemperature: '25',
  equipment: { filter: '瀑布过滤', heater: true, oxygen: true },
};
const assessment = assessSpeciesAddition({
  aquarium: configured,
  items: [{ fishId: candidate.id, quantity: 1 }],
  speciesCatalog: [candidate],
});
assert.equal(assessment?.status, 'insufficient_data', 'unknown current livestock must downgrade a future addition judgement');
assert.ok(
  assessment?.missingInformation.some(rule => rule.code === 'unresolved_existing_livestock'),
  'compatibility must name the unresolved-current-livestock evidence gap instead of silently ignoring it',
);

const plannedUnknown = preparePlannedAddition({
  aquarium: configured,
  items: [{ fishId: 'unresolved:not-a-candidate', quantity: 1 }],
  speciesCatalog: [candidate],
});
assert.equal(plannedUnknown.assessment, null);
assert.equal(plannedUnknown.policy, null, 'planned additions remain catalog-grounded; unresolved candidates are not directly addable');

console.log('unresolved existing-livestock contract passed: reality can be recorded, fake catalog identity is forbidden, and future compatibility fails closed');
