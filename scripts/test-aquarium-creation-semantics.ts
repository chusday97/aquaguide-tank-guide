import assert from 'node:assert/strict';
import { createAquariumDraft, getAquariumSetupStatus, normalizeAquariumRecord } from '../src/services/aquarium/aquarium-setup.service';

const draft = createAquariumDraft('真实新缸', new Date('2026-08-09T08:00:00.000Z'));
assert.equal(draft.startedAt, '2026-08-09');
assert.equal(draft.dimensions, undefined);
assert.equal(draft.waterType, undefined);
assert.equal(draft.targetTemperature, undefined);
assert.equal(draft.equipment, undefined);
assert.equal(draft.lastWaterChangeDate, undefined);

const normalized = normalizeAquariumRecord({ id: 'tank-1', name: '空缸', fishes: [] });
assert.equal(getAquariumSetupStatus(normalized), 'empty');
assert.equal(getAquariumSetupStatus({ ...normalized, fishes: [{ id: 'stock-1', fishId: 'sp_0001', quantity: 1, entryDate: '2026-08-09' }] }), 'incomplete');
assert.equal(getAquariumSetupStatus({ ...normalized, dimensions: { length: '60', width: '30', height: '30' }, waterType: 'Freshwater' }), 'usable');
assert.equal(getAquariumSetupStatus({ ...normalized, dimensions: { length: '60', width: '30', height: '30' }, waterType: 'Freshwater', targetTemperature: '25', equipment: { filter: '无' } }), 'complete');

console.log('aquarium creation semantics verified: unknown facts stay unknown and setup status is derived');
