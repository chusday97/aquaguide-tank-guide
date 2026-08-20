import assert from 'node:assert/strict';
import type { Aquarium, Fish } from '../src/types';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';

const guppy: Fish = {
  id: 'sp_0436',
  name: '孔雀鱼',
  scientificName: 'Poecilia reticulata',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '6.8-7.8',
  waterChangeCycle: 7,
  description: '小型胎生鳉，群体饲养。',
  diet: '杂食',
  tankSize: '至少 20 升',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
};

const tank: Aquarium = {
  id: 'stage-risk-tank',
  name: 'Stage risk tank',
  fishes: [],
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '水草泥',
  plants: ['莫丝', '水榕'],
  hardscape: ['沉木'],
  equipment: { filter: '桶滤', heater: true, oxygen: false, light: '水草灯' },
};

const adultRecord = {
  quantity: 2,
  batches: [{
    id: 'adult-batch',
    quantity: 2,
    entryDate: '2026-01-01T00:00:00.000Z',
    lifeStage: 'adult',
    reproductiveState: 'normal',
    stateUpdatedAt: '2026-08-01T00:00:00.000Z',
  }],
};

const result = evaluateTankCompatibility({
  tank,
  existingSpecies: [{ species: guppy, record: adultRecord }],
  candidateSpecies: guppy,
  candidateQuantity: 4,
  candidateLifeStage: 'fry',
} as never);

const ruleCodes = [
  ...result.blockingRules,
  ...result.warningRules,
  ...result.missingData,
].map(rule => rule.code);

console.log(JSON.stringify({ status: result.status, ruleCodes }, null, 2));

assert.equal(
  result.status,
  'not_recommended',
  'reviewed guppy adult + fry combination must not be treated as safe',
);
assert.ok(
  result.blockingRules.some(rule => rule.code === 'conspecific_fry_predation'),
  'reviewed guppy adult + fry combination must expose conspecific_fry_predation',
);

console.log('Same-species stage-risk contract: PASS');
