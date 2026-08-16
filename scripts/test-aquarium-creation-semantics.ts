import assert from 'node:assert/strict';
import { createAquariumDraft, getAquariumSetupFacts, getAquariumSetupStatus, normalizeAquariumRecord } from '../src/services/aquarium/aquarium-setup.service';

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

const explicitNoAuxiliaryEquipment = {
  ...normalized,
  dimensions: { length: '60', width: '30', height: '30' },
  waterType: 'Freshwater' as const,
  targetTemperature: '25',
  substrate: '无',
  equipment: { heater: false, oxygen: false, light: '无' as const },
};
const explicitFacts = getAquariumSetupFacts(explicitNoAuxiliaryEquipment);
assert.equal(explicitFacts.substrateKnown, true, 'explicit substrate=无 is a recorded answer');
assert.equal(explicitFacts.lightKnown, true, 'explicit light=无 is a recorded answer');
assert.equal(explicitFacts.heaterKnown, true, 'heater=false is a recorded answer');
assert.equal(explicitFacts.oxygenKnown, true, 'oxygen=false is a recorded answer');
assert.equal(explicitFacts.filterKnown, false, 'unanswered filter must remain unknown');
assert.equal(
  getAquariumSetupStatus(explicitNoAuxiliaryEquipment),
  'usable',
  'explicitly disabling auxiliary equipment must not imply that the filter question was answered',
);

const explicitNoFilter = {
  ...explicitNoAuxiliaryEquipment,
  equipment: { ...explicitNoAuxiliaryEquipment.equipment, filter: '无' as const },
};
assert.equal(getAquariumSetupFacts(explicitNoFilter).filterKnown, true, 'filter=无 is an explicit answer, not missing data');
assert.equal(getAquariumSetupStatus(explicitNoFilter), 'complete');

console.log('aquarium creation semantics verified: unknown facts stay unknown, explicit none stays known, and setup status is derived');