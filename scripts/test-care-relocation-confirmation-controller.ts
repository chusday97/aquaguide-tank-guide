import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { createCareRelocationConfirmationController } from '../src/services/care/care-relocation-confirmation.controller';
import type { AquaGuideRepository } from '../src/services/repository/aquaguide.repository';
import type { Aquarium, AquariumFish, AquariumSpeciesBatch, Fish } from '../src/types';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing fixture ${id}`);
  return species;
};

const predator = byId('sp_0049');
const candidate: Fish = {
  id: 'synthetic-care-relocation-controller-candidate',
  name: 'Care Relocation Controller Fish',
  scientificName: 'Testus care relocationis',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '6.0-8.0',
  waterChangeCycle: 7,
  description: 'Synthetic peaceful freshwater control for controller lifecycle tests.',
  diet: '杂食',
  tankSize: '至少 20 升',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
};
const catalog = [...fishData, candidate];

const batch = (id: string, quantity: number): AquariumSpeciesBatch => ({
  id,
  quantity,
  entryDate: '2026-08-17T00:00:00.000Z',
  lifeStage: 'adult',
  reproductiveState: 'normal',
  stateUpdatedAt: '2026-08-17T00:00:00.000Z',
});

const fish = (id: string, fishId: string, quantity: number, batches: AquariumSpeciesBatch[]): AquariumFish => ({
  id,
  fishId,
  quantity,
  entryDate: '2026-08-17T00:00:00.000Z',
  batches,
});

const tank = (id: string, name: string, fishes: AquariumFish[]): Aquarium => ({
  id,
  name,
  fishes,
  dimensions: { length: '120', width: '45', height: '45' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

const sourceBefore = () => tank('source', 'Source', [
  fish('predator-record', predator.id, 1, [batch('predator-batch', 1)]),
  fish('candidate-record', candidate.id, 5, [batch('candidate-batch', 5)]),
]);
const destinationBefore = () => tank('destination', 'Destination', []);
const sourceAfter = () => tank('source', 'Source', [
  fish('predator-record', predator.id, 1, [batch('predator-batch', 1)]),
]);
const destinationAfter = () => tank('destination', 'Destination', [
  fish('destination-candidate-record', candidate.id, 5, [batch('destination-candidate-batch', 5)]),
]);

const launchCandidate = {
  sourceAquariumId: 'source',
  sourceAquariumName: 'Source',
  sourceAquariumFishId: 'candidate-record',
  sourceBatchId: 'candidate-batch',
  destinationAquariumId: 'destination',
  destinationAquariumName: 'Destination',
  subjectSpeciesId: candidate.id,
  speciesName: candidate.name,
  quantity: 5,
};

type RepositoryHarness = {
  repository: AquaGuideRepository;
  calls: { getAquariums: number; relocateLivestock: number };
  requests: unknown[];
};

const makeRepository = ({
  mutationThrows = false,
  destinationInitiallyUnsafe = false,
}: {
  mutationThrows?: boolean;
  destinationInitiallyUnsafe?: boolean;
} = {}): RepositoryHarness => {
  const calls = { getAquariums: 0, relocateLivestock: 0 };
  const requests: unknown[] = [];
  let moved = false;

  const unsafeDestination = () => tank('destination', 'Destination', [
    fish('destination-predator', predator.id, 1, [batch('destination-predator-batch', 1)]),
  ]);

  const repository = {
    getAquariums: async () => {
      calls.getAquariums += 1;
      if (moved) return [sourceAfter(), destinationAfter()];
      return [sourceBefore(), destinationInitiallyUnsafe ? unsafeDestination() : destinationBefore()];
    },
    relocateLivestock: async (request: unknown) => {
      calls.relocateLivestock += 1;
      requests.push(request);
      if (mutationThrows) throw new Error('transport outcome unknown');
      moved = true;
      return { committed: true as const, replayed: false };
    },
  } as unknown as AquaGuideRepository;

  return { repository, calls, requests };
};

// One opener event creates exactly one operation identity. Re-reading attempt or
// executing twice cannot create another id or another mutation request.
{
  let operationIdCalls = 0;
  let repositoryResolutionCalls = 0;
  const harness = makeRepository();
  const controller = createCareRelocationConfirmationController({
    candidate: launchCandidate,
    catalog,
    createOperationId: () => {
      operationIdCalls += 1;
      return 'care-relocation:stable-attempt';
    },
    getRepository: async () => {
      repositoryResolutionCalls += 1;
      return harness.repository;
    },
  });

  assert.equal(operationIdCalls, 1);
  assert.equal(controller.attempt.operationId, 'care-relocation:stable-attempt');
  assert.equal(controller.attempt.request.operationId, 'care-relocation:stable-attempt');
  assert.equal(controller.attempt.request.quantity, 5);
  assert.equal(controller.attempt.facts.sourceAquariumName, 'Source');
  assert.equal(controller.attempt.facts.destinationAquariumName, 'Destination');
  assert.equal(controller.attempt.facts.speciesName, candidate.name);

  const firstPromise = controller.execute();
  const secondPromise = controller.execute();
  assert.equal(firstPromise, secondPromise, 'double execution must reuse the same promise');
  const result = await firstPromise;

  assert.equal(result.status, 'executed');
  assert.equal(repositoryResolutionCalls, 1, 'one attempt must resolve one repository instance');
  assert.equal(harness.calls.getAquariums, 2, 'successful execution requires canonical pre-load + post-load');
  assert.equal(harness.calls.relocateLivestock, 1, 'double click must not create a second mutation');
  assert.deepEqual(harness.requests, [{
    sourceAquariumId: 'source',
    sourceAquariumFishId: 'candidate-record',
    sourceBatchId: 'candidate-batch',
    destinationAquariumId: 'destination',
    quantity: 5,
    operationId: 'care-relocation:stable-attempt',
  }]);

  const reconciled = await controller.reconcile();
  assert.equal(reconciled.find(item => item.id === 'destination')?.fishes[0]?.fishId, candidate.id);
  assert.equal(repositoryResolutionCalls, 1, 'reconciliation must stay on the same resolved repository');
  assert.equal(harness.calls.relocateLivestock, 1, 'reconciliation must never mutate');
  assert.equal(harness.calls.getAquariums, 3, 'reconciliation is an additional canonical read only');
  assert.equal(operationIdCalls, 1, 'reconciliation must not generate a new operation id');
}

// A destination that is no longer safe at confirm time is blocked before the
// repository mutation callback is reached.
{
  const harness = makeRepository({ destinationInitiallyUnsafe: true });
  let repositoryResolutionCalls = 0;
  const controller = createCareRelocationConfirmationController({
    candidate: launchCandidate,
    catalog,
    createOperationId: () => 'care-relocation:fresh-block',
    getRepository: async () => {
      repositoryResolutionCalls += 1;
      return harness.repository;
    },
  });
  const result = await controller.execute();
  assert.equal(result.status, 'blocked');
  assert.equal(harness.calls.relocateLivestock, 0);
  assert.equal(harness.calls.getAquariums, 1);
  assert.equal(repositoryResolutionCalls, 1);
}

// Ambiguous transport outcome preserves the same operation id and the same
// repository session; reconciliation is a read-only recovery operation.
{
  const harness = makeRepository({ mutationThrows: true });
  let repositoryResolutionCalls = 0;
  let operationIdCalls = 0;
  const controller = createCareRelocationConfirmationController({
    candidate: launchCandidate,
    catalog,
    createOperationId: () => {
      operationIdCalls += 1;
      return 'care-relocation:unknown-attempt';
    },
    getRepository: async () => {
      repositoryResolutionCalls += 1;
      return harness.repository;
    },
  });
  const result = await controller.execute();
  assert.equal(result.status, 'mutation_state_unknown');
  if (result.status === 'mutation_state_unknown') {
    assert.equal(result.operationId, 'care-relocation:unknown-attempt');
  }
  assert.equal(harness.calls.relocateLivestock, 1);
  assert.equal(harness.calls.getAquariums, 1);
  assert.equal(repositoryResolutionCalls, 1);

  await controller.reconcile();
  assert.equal(harness.calls.relocateLivestock, 1, 'unknown reconciliation must not send another mutation');
  assert.equal(harness.calls.getAquariums, 2);
  assert.equal(repositoryResolutionCalls, 1, 'unknown reconciliation must reuse the attempt repository');
  assert.equal(operationIdCalls, 1);

  const repeatedResult = await controller.execute();
  assert.equal(repeatedResult, result, 'same controller cannot issue a second execution after unknown outcome');
  assert.equal(harness.calls.relocateLivestock, 1);
}

// If repository resolution itself fails before any repository is obtained, the
// controller may resolve again on a later read/reconciliation. No mutation can
// have happened through an unresolved repository.
{
  const harness = makeRepository();
  let repositoryResolutionCalls = 0;
  const controller = createCareRelocationConfirmationController({
    candidate: launchCandidate,
    catalog,
    createOperationId: () => 'care-relocation:repo-resolution-recovery',
    getRepository: async () => {
      repositoryResolutionCalls += 1;
      if (repositoryResolutionCalls === 1) throw new Error('session temporarily unavailable');
      return harness.repository;
    },
  });

  await assert.rejects(controller.execute(), /session temporarily unavailable/);
  assert.equal(harness.calls.relocateLivestock, 0);
  assert.equal(repositoryResolutionCalls, 1);

  await controller.reconcile();
  assert.equal(repositoryResolutionCalls, 2, 'a never-resolved repository may be resolved again for recovery');
  assert.equal(harness.calls.relocateLivestock, 0);
  assert.equal(harness.calls.getAquariums, 1);
}

console.log('Care relocation confirmation controller passed: one attempt owns one operation id and one repository session; fresh pre/post loads are repository-backed; reconcile never mutates');
