import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  aquariumWriteBaselineMatches,
  createAquariumWriteBaseline,
  type AquariumAggregateVersionShape,
} from '../src/services/repository/aquarium-write-concurrency';

const base: AquariumAggregateVersionShape = {
  id: 'aquarium-1',
  version: 4,
  species: [
    {
      id: 'species-1',
      version: 2,
      batches: [
        { id: 'batch-1', version: 5 },
        { id: 'batch-2', version: 1 },
      ],
    },
  ],
  equipment: { id: 'equipment-1', version: 3 },
};

const baseline = createAquariumWriteBaseline(base);
assert.equal(aquariumWriteBaselineMatches(baseline, structuredClone(base)), true);
assert.equal(aquariumWriteBaselineMatches(baseline, { ...structuredClone(base), version: 5 }), false);
assert.equal(
  aquariumWriteBaselineMatches(baseline, { ...structuredClone(base), version: 5 }, { ignoreAquariumVersion: true }),
  true,
  'parent PATCH may advance only aquarium.version while child baselines remain valid',
);

const remoteSpeciesAddition = structuredClone(base);
remoteSpeciesAddition.species!.push({ id: 'species-2', version: 1, batches: [{ id: 'batch-3', version: 1 }] });
assert.equal(aquariumWriteBaselineMatches(baseline, remoteSpeciesAddition), false, 'remote species additions must stop stale aggregate reconciliation');

const remoteSpeciesUpdate = structuredClone(base);
remoteSpeciesUpdate.species![0].version += 1;
assert.equal(aquariumWriteBaselineMatches(baseline, remoteSpeciesUpdate), false, 'remote species updates must stop stale aggregate reconciliation');

const remoteBatchAddition = structuredClone(base);
remoteBatchAddition.species![0].batches!.push({ id: 'batch-3', version: 1 });
assert.equal(aquariumWriteBaselineMatches(baseline, remoteBatchAddition), false, 'remote batch additions must stop stale batch deletion');

const remoteBatchUpdate = structuredClone(base);
remoteBatchUpdate.species![0].batches![0].version += 1;
assert.equal(aquariumWriteBaselineMatches(baseline, remoteBatchUpdate), false, 'remote batch updates must stop stale quantity/state overwrite');

const remoteEquipmentUpdate = structuredClone(base);
remoteEquipmentUpdate.equipment!.version += 1;
assert.equal(aquariumWriteBaselineMatches(baseline, remoteEquipmentUpdate), false, 'remote equipment updates must stop stale equipment overwrite');

const remoteEquipmentRemoval = structuredClone(base);
delete remoteEquipmentRemoval.equipment;
assert.equal(aquariumWriteBaselineMatches(baseline, remoteEquipmentRemoval), false, 'remote equipment removal must stop stale recreation');

const repository = readFileSync(resolve(import.meta.dirname, '../src/services/repository/api-aquaguide.repository.ts'), 'utf8');
const saveStart = repository.indexOf('async saveAquarium');
const saveEnd = repository.indexOf('async removeLivestock', saveStart);
assert.ok(saveStart >= 0 && saveEnd > saveStart);
const save = repository.slice(saveStart, saveEnd);
const preflightIndex = save.indexOf('const current = await apiRequest<ApiAquarium>');
const baselineFreshIndex = save.indexOf('const baselineFresh = Boolean(');
const safeResumeIndex = save.indexOf('aquariumPartialSaveCanResume(pending.before, current, pending.target)', baselineFreshIndex);
const patchIndex = save.indexOf("method: 'PATCH'");
const secondFreshnessIndex = save.indexOf("this.assertAquariumAggregateFresh(aquarium.id, saved, { ignoreAquariumVersion: true })");
const childReconcileIndex = save.indexOf('const currentById = new Map');
assert.ok(preflightIndex >= 0 && preflightIndex < baselineFreshIndex, 'existing aggregate save must read current server state before checking the child baseline');
assert.ok(baselineFreshIndex < safeResumeIndex, 'a stale child baseline may only proceed through explicit safe-resume validation');
assert.ok(safeResumeIndex < patchIndex, 'unsafe child drift must fail before the parent write');
assert.ok(patchIndex < secondFreshnessIndex, 'parent write must be followed by a second child freshness check');
assert.ok(secondFreshnessIndex < childReconcileIndex, 'post-PATCH child drift must fail before child reconciliation');
assert.ok(
  save.includes('aquariumWriteBaselineMatches(baseline, current, { ignoreAquariumVersion: true })'),
  'preflight must leave parent version replay to PATCH idempotency while still guarding child drift',
);
assert.match(save, /if \(!version \|\| !this\.aquariumWriteBaselines\.has\(aquarium\.id\)\)/, 'existing UUID saves without a known baseline must fail closed');
assert.doesNotMatch(
  save.slice(0, save.indexOf('} else {')),
  /method: 'POST'/,
  'an existing UUID must never fall through to create semantics when its version cache is missing',
);

const memorialStart = repository.indexOf('async saveLivestockMemorial');
const memorialEnd = repository.indexOf('private rememberReminder', memorialStart);
assert.ok(memorialStart >= 0 && memorialEnd > memorialStart);
const memorial = repository.slice(memorialStart, memorialEnd);
assert.ok(
  memorial.includes('const refreshed = await apiRequest<ApiAquarium>(§/aquariums/¤{input.aquariumId}§);'.replace(/§/g, String.fromCharCode(96)).replace(/¤/g, '$')),
  'server-side memorial quantity changes must refresh the authoritative aquarium snapshot',
);
assert.ok(
  memorial.includes('const updatedAquarium = this.rememberAquarium(refreshed);'),
  'memorial refresh must update aggregate concurrency baselines before returning',
);

console.log('aquarium aggregate concurrency passed: remote drift fails closed, parent replay stays valid, self-writes refresh baselines');
