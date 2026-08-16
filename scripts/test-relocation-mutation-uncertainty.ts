import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { executeFreshRelocation } from '../src/lib/relocationExecutionPolicy';
import type { Aquarium, AquariumSpeciesBatch, Fish } from '../src/types';

const predator = fishData.find(item => item.id === 'sp_0049');
assert.ok(predator, 'reviewed predator fixture missing');

const candidate: Fish = {
  id: 'synthetic-relocation-uncertainty-candidate',
  name: 'Relocation Uncertainty Test Fish',
  scientificName: 'Testus relocationis incertus',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '6.0-8.0',
  waterChangeCycle: 7,
  description: 'Policy-only freshwater control.',
  diet: '杂食',
  tankSize: '至少 20 升',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
};
const catalog = [...fishData, candidate];

const makeBatch = (id: string, quantity: number): AquariumSpeciesBatch => ({
  id,
  quantity,
  entryDate: '2026-08-17T00:00:00.000Z',
  lifeStage: 'adult',
  reproductiveState: 'normal',
  stateUpdatedAt: '2026-08-17T00:00:00.000Z',
});

const source: Aquarium = {
  id: 'source',
  name: 'Source',
  waterType: 'Freshwater',
  targetTemperature: '25',
  dimensions: { length: '120', width: '45', height: '45' },
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
  fishes: [
    {
      id: 'predator-record',
      fishId: predator.id,
      quantity: 1,
      entryDate: '2026-08-17T00:00:00.000Z',
      batches: [makeBatch('predator-batch', 1)],
    },
    {
      id: 'candidate-record',
      fishId: candidate.id,
      quantity: 5,
      entryDate: '2026-08-17T00:00:00.000Z',
      batches: [makeBatch('candidate-batch', 5)],
    },
  ],
};

const destination: Aquarium = {
  id: 'destination',
  name: 'Destination',
  waterType: 'Freshwater',
  targetTemperature: '25',
  dimensions: { length: '120', width: '45', height: '45' },
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
  fishes: [],
};

const operationId = 'relocation-uncertainty-operation-1';
let loads = 0;
const result = await executeFreshRelocation({
  request: {
    sourceAquariumId: source.id,
    sourceAquariumFishId: 'candidate-record',
    sourceBatchId: 'candidate-batch',
    destinationAquariumId: destination.id,
    quantity: 5,
    operationId,
  },
  catalog,
  loadAquariums: async () => {
    loads += 1;
    return [structuredClone(source), structuredClone(destination)];
  },
  relocate: async () => {
    throw new Error('transport disconnected after request was sent');
  },
});

assert.equal(result.status, 'mutation_state_unknown');
assert.equal(loads, 1, 'policy must not pretend it has post-mutation state after an ambiguous mutation transport failure');
if (result.status === 'mutation_state_unknown') {
  assert.equal(result.operationId, operationId, 'the same idempotency operation ID must be preserved for reconciliation');
  assert.match(result.errorMessage, /transport disconnected/);
  assert.equal(result.freshDestinationEvaluation.status, 'compatible_by_current_evidence');
}

console.log('relocation mutation uncertainty passed: a rejected mutation transport is not treated as a confirmed rollback; operation identity is preserved for reconciliation before any retry');
