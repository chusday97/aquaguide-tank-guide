import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Aquarium } from '../src/types';
import {
  aquariumComponentSemanticKey,
  aquariumDesiredComponents,
  aquariumEquipmentMatchesTarget,
  aquariumPartialSaveCanResume,
  aquariumSaveFingerprint,
  canonicalizeAquariumResumeInput,
  type AquariumSaveServerSnapshot,
} from '../src/services/repository/aquarium-save-resume';

const aquariumId = '11111111-1111-4111-8111-111111111111';
const speciesId = '22222222-2222-4222-8222-222222222222';
const batchId = '33333333-3333-4333-8333-333333333333';
const equipmentId = '44444444-4444-4444-8444-444444444444';

const before: AquariumSaveServerSnapshot = {
  id: aquariumId,
  name: '旧名字',
  waterType: 'Freshwater',
  lengthCm: 60,
  widthCm: 30,
  heightCm: 35,
  targetTemperatureC: 25,
  version: 4,
  species: [{
    id: speciesId,
    speciesCatalogKey: 'sp_0001',
    quantity: 2,
    entryDate: '2026-09-01',
    version: 2,
    batches: [{
      id: batchId,
      quantity: 2,
      entryDate: '2026-09-01',
      lifeStage: 'adult',
      reproductiveState: 'normal',
      stateUpdatedAt: '2026-09-01T00:00:00.000Z',
      version: 3,
    }],
  }],
  equipment: {
    id: equipmentId,
    filterType: '桶滤',
    heater: true,
    oxygen: false,
    lightType: '普通灯',
    version: 2,
  },
};

const desired: Aquarium = {
  id: aquariumId,
  name: '新名字',
  waterType: 'Freshwater',
  dimensions: { length: '60', width: '30', height: '35' },
  targetTemperature: '25',
  fishes: [
    {
      id: speciesId,
      fishId: 'sp_0001',
      quantity: 2,
      entryDate: '2026-09-01',
      batches: [
        {
          id: batchId,
          quantity: 1,
          entryDate: '2026-09-01',
          lifeStage: 'adult',
          reproductiveState: 'normal',
          stateUpdatedAt: '2026-09-24T01:00:00.000Z',
        },
        {
          id: 'batch_local_split',
          quantity: 1,
          entryDate: '2026-09-20',
          lifeStage: 'juvenile',
          reproductiveState: 'unknown',
          stateUpdatedAt: '2026-09-24T01:00:00.000Z',
        },
      ],
    },
    {
      id: 'local_species_2',
      fishId: 'sp_0002',
      quantity: 3,
      entryDate: '2026-09-22',
      batches: [{
        id: 'batch_local_species_2',
        quantity: 3,
        entryDate: '2026-09-22',
        lifeStage: 'unknown',
        reproductiveState: 'unknown',
        stateUpdatedAt: '2026-09-24T01:00:00.000Z',
      }],
    },
  ],
  equipment: {
    filter: '桶滤',
    heater: true,
    oxygen: false,
    light: '普通灯',
  },
};

const partial: AquariumSaveServerSnapshot = {
  ...structuredClone(before),
  name: '新名字',
  version: 5,
  species: [
    {
      ...structuredClone(before.species[0]),
      version: 4,
      batches: [
        {
          ...structuredClone(before.species[0].batches[0]),
          quantity: 1,
          version: 4,
        },
        {
          id: '55555555-5555-4555-8555-555555555555',
          quantity: 1,
          entryDate: '2026-09-20',
          lifeStage: 'juvenile',
          reproductiveState: 'unknown',
          stateUpdatedAt: '2026-09-24T01:00:02.000Z',
          version: 1,
        },
      ],
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      speciesCatalogKey: 'sp_0002',
      quantity: 3,
      entryDate: '2026-09-22',
      version: 1,
      batches: [{
        id: '77777777-7777-4777-8777-777777777777',
        quantity: 3,
        entryDate: '2026-09-22',
        lifeStage: 'unknown',
        reproductiveState: 'unknown',
        stateUpdatedAt: '2026-09-24T01:00:03.000Z',
        version: 1,
      }],
    },
  ],
};

assert.equal(
  aquariumPartialSaveCanResume(before, partial, desired),
  true,
  'own parent + batch + species progress must be recognized as a resumable intermediate state',
);

const desiredWithDistinctSpeciesEntryDate = structuredClone(desired);
desiredWithDistinctSpeciesEntryDate.fishes[1].entryDate = '2026-09-24';
desiredWithDistinctSpeciesEntryDate.fishes[1].batches![0].entryDate = '2026-09-22';
const partialWithInitialBatchDate = structuredClone(partial);
partialWithInitialBatchDate.species[1].entryDate = '2026-09-22';
assert.equal(
  aquariumPartialSaveCanResume(before, partialWithInitialBatchDate, desiredWithDistinctSpeciesEntryDate),
  true,
  'a newly created batched species must resume using the initial batch entry date actually sent by saveAquarium',
);

const canonical = canonicalizeAquariumResumeInput(desired, partial);
assert.equal(canonical.fishes[0].id, speciesId);
assert.equal(canonical.fishes[0].batches?.[1].id, '55555555-5555-4555-8555-555555555555');
assert.equal(canonical.fishes[1].id, '66666666-6666-4666-8666-666666666666');
assert.equal(canonical.fishes[1].batches?.[0].id, '77777777-7777-4777-8777-777777777777');

const rogueSpecies = structuredClone(partial);
rogueSpecies.species.push({
  id: '88888888-8888-4888-8888-888888888888',
  speciesCatalogKey: 'sp_external',
  quantity: 1,
  entryDate: '2026-09-24',
  version: 1,
  batches: [{
    id: '99999999-9999-4999-8999-999999999999',
    quantity: 1,
    entryDate: '2026-09-24',
    lifeStage: 'adult',
    reproductiveState: 'normal',
    version: 1,
  }],
});
assert.equal(
  aquariumPartialSaveCanResume(before, rogueSpecies, desired),
  false,
  'an unrelated remote species addition must never be absorbed into a pending save',
);

const rogueParent = { ...structuredClone(partial), name: '另一台设备改的名字' };
assert.equal(
  aquariumPartialSaveCanResume(before, rogueParent, desired),
  false,
  'a parent value outside both before and desired must block resume',
);

const rogueEquipment = structuredClone(partial);
rogueEquipment.equipment = { ...rogueEquipment.equipment!, filterType: '海绵过滤', version: 3 };
assert.equal(
  aquariumPartialSaveCanResume(before, rogueEquipment, desired),
  false,
  'unrelated equipment drift must block resume',
);

const equipmentTarget = structuredClone(desired);
equipmentTarget.equipment = {
  filter: '上滤',
  heater: false,
  oxygen: true,
  light: '水草灯',
};
const equipmentWritePartial = structuredClone(before);
equipmentWritePartial.name = '新名字';
equipmentWritePartial.version = 5;
equipmentWritePartial.equipment = {
  ...equipmentWritePartial.equipment!,
  filterType: '上滤',
  heater: false,
  oxygen: true,
  lightType: '水草灯',
  version: 3,
};
assert.equal(
  aquariumPartialSaveCanResume(before, equipmentWritePartial, equipmentTarget),
  true,
  'equipment already written to the target state must be recognized as resumable progress after response loss',
);
assert.equal(
  aquariumEquipmentMatchesTarget(equipmentWritePartial.equipment, equipmentTarget.equipment),
  true,
  'retry can detect that the equipment PUT already reached the desired state',
);

const unknownEquipmentTarget = structuredClone(desired);
delete unknownEquipmentTarget.equipment;
assert.equal(
  aquariumPartialSaveCanResume(before, partial, unknownEquipmentTarget),
  true,
  'omitted equipment means unknown/unmodified and must preserve the before-state equipment during resume',
);
assert.equal(
  aquariumEquipmentMatchesTarget(before.equipment, undefined),
  false,
  'omitted equipment must not be reinterpreted as an explicit equipment deletion target',
);

const componentBefore: AquariumSaveServerSnapshot = {
  ...structuredClone(before),
  components: [{
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    componentType: 'substrate',
    name: '河沙',
    version: 2,
  }],
};
const componentTarget: Aquarium = {
  ...structuredClone(desired),
  substrate: '水草泥',
  plants: ['sp_plant_1', 'sp_plant_1'],
  hardscape: ['sp_hardscape_1'],
};
assert.deepEqual(
  aquariumDesiredComponents(componentTarget),
  [
    { componentType: 'hardscape', name: 'sp_hardscape_1' },
    { componentType: 'plant', name: 'sp_plant_1' },
    { componentType: 'substrate', name: '水草泥' },
  ],
  'component targets must be normalized, de-duplicated and stable for replay',
);
const componentPartial: AquariumSaveServerSnapshot = {
  ...structuredClone(partial),
  components: [
    ...componentBefore.components!,
    {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      componentType: 'substrate',
      name: '水草泥',
      version: 1,
    },
    {
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      componentType: 'plant',
      name: 'sp_plant_1',
      version: 1,
    },
  ],
};
assert.equal(
  aquariumPartialSaveCanResume(componentBefore, componentPartial, componentTarget),
  true,
  'component create progress may coexist with an old component that is still awaiting deletion',
);
const componentAfterDelete = structuredClone(componentPartial);
componentAfterDelete.components = componentAfterDelete.components!.filter(item => item.name !== '河沙');
assert.equal(
  aquariumPartialSaveCanResume(componentBefore, componentAfterDelete, componentTarget),
  true,
  'a requested component deletion must be resumable once the old component is gone',
);
const rogueComponent = structuredClone(componentPartial);
rogueComponent.components!.push({
  id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  componentType: 'plant',
  name: 'external_plant',
  version: 1,
});
assert.equal(
  aquariumPartialSaveCanResume(componentBefore, rogueComponent, componentTarget),
  false,
  'an unrelated remote component addition must block partial-save resume',
);
const retainedComponentTarget: Aquarium = { ...structuredClone(desired), substrate: '河沙' };
const missingRetainedComponent = { ...structuredClone(partial), components: [] };
assert.equal(
  aquariumPartialSaveCanResume(componentBefore, missingRetainedComponent, retainedComponentTarget),
  false,
  'remote deletion of a component still required by the target must block resume',
);
assert.notEqual(
  aquariumSaveFingerprint(desired),
  aquariumSaveFingerprint({ ...desired, plants: ['sp_plant_1'] }),
  'environment component changes must participate in partial-save fingerprinting',
);
assert.equal(
  aquariumComponentSemanticKey({ componentType: 'plant', name: ' sp_plant_1 ' }),
  'plant:sp_plant_1',
);

const missingRetainedSpecies = structuredClone(partial);
missingRetainedSpecies.species = missingRetainedSpecies.species.filter(item => item.id !== speciesId);
assert.equal(
  aquariumPartialSaveCanResume(before, missingRetainedSpecies, desired),
  false,
  'remote deletion of a species still present in the target must block resume',
);

const deleteTarget: Aquarium = {
  ...desired,
  fishes: desired.fishes.filter(item => item.id !== speciesId),
};
const deletionPartial: AquariumSaveServerSnapshot = {
  ...structuredClone(before),
  name: '新名字',
  version: 5,
  species: [],
};
assert.equal(
  aquariumPartialSaveCanResume(before, deletionPartial, deleteTarget),
  true,
  'a confirmed deletion that is part of the requested target is resumable',
);

assert.equal(aquariumSaveFingerprint(desired), aquariumSaveFingerprint(structuredClone(desired)));
assert.notEqual(
  aquariumSaveFingerprint(desired),
  aquariumSaveFingerprint({ ...desired, name: '用户又改了另一个名字' }),
  'a different target must not reuse a pending partial-save resume',
);

const repository = readFileSync(resolve(import.meta.dirname, '../src/services/repository/api-aquaguide.repository.ts'), 'utf8');
const saveStart = repository.indexOf('async saveAquarium');
const saveEnd = repository.indexOf('async removeLivestock', saveStart);
assert.ok(saveStart >= 0 && saveEnd > saveStart);
const save = repository.slice(saveStart, saveEnd);
assert.match(save, /pendingAtStart && pendingAtStart\.fingerprint !== fingerprint/, 'changed target must fail closed while a partial save is pending');
assert.match(save, /aquariumPartialSaveCanResume\(pending\.before, current, pending\.target\)/, 'retry must prove the server is a safe intermediate state before adopting it');
assert.match(save, /canonicalizeAquariumResumeInput\(pending\.target, current\)/, 'retry must map server-generated ids back onto the original target');
assert.match(save, /await recoverPendingSave\(error\)/, 'failed saves must probe for safe partial progress without masking the original error');
assert.match(
  save,
  /if \(!pending \|\| \(!parentWriteConfirmed && !dependencyFailure\)\) \{\s*if \(pending\) this\.aquariumSaveResumes\.delete\(resumeKey\);/s,
  'deterministic failures before a confirmed write must clear resume state instead of blocking corrected input',
);
assert.match(
  save,
  /desiredAquarium\.equipment\s*&& !aquariumEquipmentMatchesTarget\(saved\.equipment, desiredAquarium\.equipment\)/s,
  'a resumed save must skip equipment PUT when the server already reached the requested equipment state',
);
assert.match(
  save,
  /for \(const current of saved\.species \|\| \[\]\) \{\s*if \(!retained\.has\(current\.id\)\)/s,
  'species deletion retries must derive work from the refreshed server snapshot so an already deleted species is not deleted again',
);
assert.match(
  save,
  /const desiredComponents = aquariumDesiredComponents\(desiredAquarium\);/,
  'aggregate save must reconcile substrate, plant and hardscape components',
);
assert.match(
  save,
  /idempotencyKey: `aquarium-save-component-create:\$\{saved\.id\}:\$\{stableOperationToken\(aquariumComponentSemanticKey\(desiredComponent\)\)\}`/,
  'component creates must use stable bounded semantic idempotency keys',
);
assert.match(
  save,
  /idempotencyKey: `aquarium-save-component-delete:\$\{current\.id\}:v\$\{current\.version\}`/,
  'component deletes must use optimistic-version-bound idempotency keys',
);
assert.match(repository, /this\.aquariumSaveResumes\.clear\(\);/, 'a full authoritative aquarium reload must clear pending resume state');

console.log('aquarium partial-save resume passed: safe intermediate progress resumes, generated ids canonicalize, unrelated remote drift fails closed');
